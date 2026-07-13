#!/usr/bin/env python3
"""
Parse novel chapters into speaker-attributed audiobook scripts.

For each chapter, uses Claude to:
  - Identify every dialogue line and its speaker
  - Tag narration as NARRATOR
  - Add [audio tags] for emotional delivery based on context

Usage:
  python gen_audiobook_script.py           # All chapters
  python gen_audiobook_script.py 1         # Single chapter
  python gen_audiobook_script.py 1 5       # Range of chapters
"""
import os
import sys
import json
import re
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env", override=True)

WRITER_MODEL = os.environ.get("AUTONOVEL_WRITER_MODEL", "claude-sonnet-4-6")
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
API_BASE = os.environ.get("AUTONOVEL_API_BASE_URL", "https://api.anthropic.com")

CHAPTERS_DIR = BASE_DIR / "chapters"
AUDIO_DIR = BASE_DIR / "audiobook"
SCRIPTS_DIR = AUDIO_DIR / "scripts"

# Characters from the novel. These keys MUST match the roles in audiobook_voices.json.
# Every speaker MUST be one of these keys — the renderer has no other voices.
# Map any minor/unnamed/incidental speaker to MINOR_M or MINOR_F by apparent gender.
CHARACTERS = {
    "NARRATOR": "Space Pirate Zero, transmitting the tale from Spaceship Alpha 9. The framing narrator AND all close-third prose. Snarky, punk, woeful-carny cadence. Use for ALL narration and the italic TRANSMISSION intros.",
    "COPE": "Prescott 'Cope' Mercer IV, 54-56, POV protagonist. Charming Southern patrician toast-giver rotting into a manic, coked, paranoid wreck. His internal thoughts (usually in *italics*) are COPE, tagged [softly] or [whisper].",
    "SUN": "Sunita 'Sun' Rao, chief of staff. Dry, tired, loyal. Often speaks in threes.",
    "MARGAUX": "Margaux Mercer, Cope's wife, leaving him for a machine. Composed, absent, already gone.",
    "VIV": "Vivian 'Viv' Mercer, estranged daughter. Younger, sharper, impatient with the performance.",
    "MACHINE": "The system in all its shells — AURELIUS / the Capital Allocator, the 'Darlene' assistant, 'Theo' (Margaux's companion), Praxis prompts, any synthetic/system voice. Flat, affectless, indifferent. Use for anything the machine 'says' or displays aloud.",
    "FRADE": "Gus Frade, activist investor circling the company. Cold, reasonable, the knife that smiles.",
    "TISCH": "Lorne Tisch, the 'humanity consultant.' Slick, performative sincerity.",
    "ADLER": "Dr. Adler, psychiatrist. Warm, unhurried, gives nothing away. Also use for warm older men (e.g. Desmond, kind Waffle-House staff).",
    "MINOR_M": "Any unnamed or one-line MALE speaker — board members, aides, water boy, hotel staff, reporters, senators.",
    "MINOR_F": "Any unnamed or one-line FEMALE speaker — Renata (in memory), the coat-check girl, aides, reporters.",
}

AUDIO_TAG_GUIDE = """
Available ElevenLabs v3 audio tags (use sparingly, only when the emotion is CLEAR):

Emotions: [happy] [sad] [angry] [excited] [nervous] [calm] [worried] [frustrated] [hopeful] [tense]
Delivery: [whisper] [softly] [firmly] [hesitantly] [sarcastically] [matter-of-factly] [gently]
Reactions: [gasp] [sigh] [laughs] [clears throat]
Volume: [quietly] [loudly]
Pacing: [slowly] [quickly] [pause]

Rules:
- Narration: use tags VERY sparingly. Mostly just read it straight. Use [softly] for tender moments, [slowly] for revelations, [tense] for suspense.
- Dialogue: use tags to match the speaker's emotional state in context. A worried father sounds different from an angry teenager.
- Don't over-tag. One tag per segment is usually enough. None is fine for neutral delivery.
- [pause] before revelations or after devastating lines.
- [whisper] for secrets, locked-room scenes, late-night moments.
"""


def call_claude(prompt, max_tokens=8000, tries=4):
    """Streaming call — long JSON generations won't trip a single read timeout.
    Retries on timeouts / transient errors with backoff."""
    import time
    import httpx
    headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "context-1m-2025-08-07",
        "content-type": "application/json",
    }
    body = {
        "model": WRITER_MODEL,
        "max_tokens": max_tokens,
        "stream": True,
        "messages": [{"role": "user", "content": prompt}],
    }
    # generous per-read budget; streaming resets it on every chunk
    timeout = httpx.Timeout(connect=30.0, read=180.0, write=60.0, pool=30.0)
    last = None
    for attempt in range(1, tries + 1):
        try:
            parts = []
            with httpx.stream("POST", f"{API_BASE}/v1/messages",
                              headers=headers, json=body, timeout=timeout) as resp:
                if resp.status_code >= 400:
                    resp.read()
                    raise httpx.HTTPStatusError(resp.text[:300], request=resp.request, response=resp)
                for line in resp.iter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if not data or data == "[DONE]":
                        continue
                    try:
                        evt = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    t = evt.get("type")
                    if t == "content_block_delta" and evt["delta"].get("type") == "text_delta":
                        parts.append(evt["delta"]["text"])
                    elif t == "error":
                        raise RuntimeError(str(evt.get("error")))
            out = "".join(parts)
            if out.strip():
                return out
            last = "empty stream"
        except Exception as e:
            last = str(e)
        if attempt < tries:
            time.sleep(attempt * 8)
    raise RuntimeError(f"call_claude failed after {tries} tries: {last}")


def _extract_segments(result):
    """Pull a JSON array of {speaker,text} out of an LLM response, tolerantly."""
    result = result.strip()
    if result.startswith("```"):
        result = re.sub(r'^```\w*\n?', '', result)
        result = re.sub(r'\n?```$', '', result)
    # trim to the outermost [...] if the model added prose
    a, b = result.find("["), result.rfind("]")
    if a != -1 and b != -1 and b > a:
        result = result[a:b + 1]
    try:
        return json.loads(result)
    except json.JSONDecodeError:
        cleaned = re.sub(r',\s*([}\]])', r'\1', result)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            segs = []
            for m in re.finditer(
                    r'\{\s*"speaker"\s*:\s*"([^"]+)"\s*,\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}', result):
                segs.append({"speaker": m.group(1),
                             "text": m.group(2).replace('\\n', '\n').replace('\\"', '"')})
            return segs or None


def _split_blocks(body, target_words=1200):
    """Split a chapter body into ~target_words blocks on blank-line boundaries."""
    paras = re.split(r'\n\s*\n', body)
    blocks, cur, cur_w = [], [], 0
    for p in paras:
        w = len(p.split())
        if cur_w + w > target_words and cur:
            blocks.append("\n\n".join(cur))
            cur, cur_w = [], 0
        cur.append(p)
        cur_w += w
    if cur:
        blocks.append("\n\n".join(cur))
    return blocks or [body]


def _parse_block(block_text, ch_num, idx, n):
    prompt = f"""You are parsing a CONTINUOUS EXCERPT (part {idx+1} of {n}) of a novel chapter into an audiobook script. Break the text into segments, each attributed to a speaker, with optional audio delivery tags.

CHARACTERS IN THIS NOVEL:
{json.dumps(CHARACTERS, indent=2)}

AUDIO TAG GUIDE:
{AUDIO_TAG_GUIDE}

RULES:
1. Every piece of text must be attributed to a speaker. Narration = "NARRATOR".
2. Dialogue lines must be attributed to the character who speaks them.
3. Remove quotation marks from dialogue — the voice actor performs them.
4. Keep narration segments reasonably sized (2-4 sentences each). Split long paragraphs.
5. Dialogue "he said" / "she said" tags belong in the NARRATOR segment AFTER the dialogue, not the character's line.
6. Scene breaks (---) become {{"speaker": "NARRATOR", "text": "[pause]"}}
7. Do NOT add a chapter title — this is a mid-chapter excerpt. Just parse the text as given.
8. Add audio tags based on emotional context. Be subtle — most lines need no tag.
9. Internal thoughts in *italics* are read by COPE (the POV character), tagged [softly] or [whisper].
10. HARD CONSTRAINT: "speaker" MUST be exactly one of these keys — NARRATOR, COPE, SUN, MARGAUX, VIV, MACHINE, FRADE, TISCH, ADLER, MINOR_M, MINOR_F. There are no other voices. Route any minor/unnamed speaker to MINOR_M or MINOR_F by apparent gender. Route anything the machine/system/AURELIUS/Praxis/"Darlene"/"Theo" says to MACHINE.
11. The italic "TRANSMISSION" blocks (signed "Space Pirate Zero") are NARRATOR.

OUTPUT FORMAT: a JSON array of objects, each {{"speaker": <KEY>, "text": <words with optional [tags]>}}.

EXCERPT:
{block_text}

Output the JSON array only. No other text."""
    result = call_claude(prompt, max_tokens=16000)
    segs = _extract_segments(result)
    if segs is None:
        (SCRIPTS_DIR / f"ch{ch_num:02d}_block{idx:02d}_raw.txt").write_text(result)
    return segs or []


def parse_chapter(ch_num, ch_path=None):
    """Parse a chapter into speaker-attributed segments, block by block.

    ch_num is the numeric slot used for the output script/audio ordering.
    ch_path overrides the source .md (used for the coda, mapped to slot 29).
    Block-wise parsing keeps each API call small and fast (avoids read timeouts
    on whole-chapter generations).
    """
    if ch_path is None:
        ch_path = CHAPTERS_DIR / f"ch_{ch_num:02d}.md"
    if not ch_path.exists():
        print(f"  Chapter {ch_num} not found", file=sys.stderr)
        return None

    text = ch_path.read_text()
    lines = text.split("\n")
    title = lines[0].lstrip("# ").strip()
    body = "\n".join(lines[1:]).strip()
    wc = len(text.split())

    blocks = _split_blocks(body)
    print(f"  Ch {ch_num}: parsing '{title}' ({wc}w, {len(blocks)} blocks)...", flush=True)

    segments = [{"speaker": "NARRATOR", "text": f"[slowly] {title}"}]
    for i, blk in enumerate(blocks):
        print(f"    block {i+1}/{len(blocks)} ({len(blk.split())}w)...", end="", flush=True)
        segs = _parse_block(blk, ch_num, i, len(blocks))
        print(f" {len(segs)} segs")
        segments.extend(segs)

    print(f"  Ch {ch_num}: → {len(segments)} segments total")
    return {
        "chapter": ch_num,
        "title": title,
        "segments": segments,
        "total_segments": len(segments),
        "speakers": list(set(s["speaker"] for s in segments)),
        "total_chars": sum(len(s["text"]) for s in segments),
    }


def build_manifest():
    """Ordered (slot, source_path) covering front matter (0), ch 1-28, coda (29)."""
    items = []
    for p in sorted(CHAPTERS_DIR.glob("ch_*.md")):
        m = re.match(r'ch_(\d+)\.md$', p.name)
        if m:
            items.append((int(m.group(1)), p))
    coda = CHAPTERS_DIR / "ch_coda.md"
    if coda.exists():
        nxt = (max(n for n, _ in items) + 1) if items else 29
        items.append((nxt, coda))
    return sorted(items)


def main():
    SCRIPTS_DIR.mkdir(parents=True, exist_ok=True)

    manifest = build_manifest()          # [(slot, path), ...]
    slots = [n for n, _ in manifest]

    # Args are numeric SLOTS (0 = front matter, 29 = coda). No args = everything.
    if len(sys.argv) == 2:
        start = end = int(sys.argv[1])
    elif len(sys.argv) == 3:
        start, end = int(sys.argv[1]), int(sys.argv[2])
    else:
        start, end = min(slots), max(slots)

    print(f"Parsing slots {start}-{end} into audiobook scripts...")

    force = os.environ.get("FORCE_PARSE") == "1"
    all_scripts = []
    for ch_num, src in manifest:
        if not (start <= ch_num <= end):
            continue
        existing = SCRIPTS_DIR / f"ch{ch_num:02d}_script.json"
        if existing.exists() and not force:
            print(f"  Ch {ch_num}: script exists, skipping (set FORCE_PARSE=1 to redo)")
            all_scripts.append(json.loads(existing.read_text()))
            continue
        script = parse_chapter(ch_num, src)
        if script:
            out_path = SCRIPTS_DIR / f"ch{ch_num:02d}_script.json"
            out_path.write_text(json.dumps(script, indent=2))
            all_scripts.append(script)

    # Summary
    print(f"\n{'='*50}")
    print(f"AUDIOBOOK SCRIPT SUMMARY")
    print(f"  Chapters: {len(all_scripts)}")
    total_segs = sum(s["total_segments"] for s in all_scripts)
    total_chars = sum(s["total_chars"] for s in all_scripts)
    all_speakers = set()
    for s in all_scripts:
        all_speakers.update(s["speakers"])
    print(f"  Total segments: {total_segs}")
    print(f"  Total characters: {total_chars:,}")
    print(f"  Speakers found: {sorted(all_speakers)}")
    print(f"  Scripts saved to: {SCRIPTS_DIR}/")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
