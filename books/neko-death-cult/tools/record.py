#!/usr/bin/env python3
"""
Record a Maneki Neko Death Cult episode with ElevenLabs (multi-voice, v3).

Parses a tagged `chapters/ch_NN.audio.md` script (see ../audio.md), renders each
@SPEAKER run in its cast voice via per-segment Text-to-Speech (v3, so inline
[tags] are acted), applies per-role settings (SPZ = chaos + faster; others steady),
inserts real silence at every <break time="..."/>, and stitches with ffmpeg.

Usage:
  uv run --with elevenlabs python tools/record.py chapters/ch_01.audio.md
  uv run --with elevenlabs python tools/record.py chapters/ch_01.audio.md --limit 6
Requires ELEVENLABS_API_KEY in the environment (source ../../.env first).
"""
import os, re, sys, time, argparse, subprocess, tempfile
from pathlib import Path

# Fixed cast — must match audio.md. Never change across episodes.
CAST = {
    "NARRATOR": "8bOIcU4hJx9LYJV4NS1I",  # SPZ — custom: raspy, Belfast lilt, raw/punk
    "KAT":      "pFZP5JQG7iQjIQuC4Bku",  # Lily   — velvety actress
    "WOMAN":    "4JHJuokHot8d75SnR53J",  # Clarissa — Upper-Class British (agent, posh contempt)
    "MAN":      "agL69Vji082CshT65Tcy",  # Blackwood — Sinister, Posh & British (agent)
    "BEARDED":  "JBFqnCBsd6RMkjVDRZzb",  # George — warm British storyteller (CSM)
    "GUEST":    "N2lVS1w4EtoT3dr4eOWO",  # Callum — husky (bit parts)
}
V3 = "eleven_v3"                 # expressive, honors [tags] — but drops text at low stability
V2 = "eleven_multilingual_v2"    # rock-solid, no drops; ignores [tags] (we strip them)
# Per-role render config. SPZ stays v3 but at stability 0.5 (Natural) for RELIABILITY
# — 0.0 (Creative) was dropping whole paragraphs. Native speed (no atempo). The two
# Cult agents run on v2 at HIGH stability = dead, monotone, emotionless G-men.
ROLES = {
    "NARRATOR": {"model": V3, "strip": False,
                 "vs": {"stability": 0.5, "similarity_boost": 0.85, "style": 0.35, "use_speaker_boost": True, "speed": 1.08}},
    "BEARDED":  {"model": V3, "strip": False,
                 "vs": {"stability": 0.5, "similarity_boost": 0.85, "style": 0.0, "use_speaker_boost": True, "speed": 1.0}},
    "WOMAN":    {"model": V3, "strip": False,   # posh, human; disdain from tags at moderate stability
                 "vs": {"stability": 0.45, "similarity_boost": 0.85, "style": 0.0, "use_speaker_boost": True, "speed": 1.0}},
    "MAN":      {"model": V3, "strip": False,
                 "vs": {"stability": 0.45, "similarity_boost": 0.85, "style": 0.0, "use_speaker_boost": True, "speed": 1.0}},
    "_default": {"model": V3, "strip": False,
                 "vs": {"stability": 0.5, "similarity_boost": 0.85, "style": 0.2, "use_speaker_boost": True, "speed": 1.0}},
}
COALESCE_MAX = 2400                  # max chars to merge into one continuous render
MIN_BYTES_PER_CHAR = 220             # v3 drop-detection floor → retry if a seg is way under
TAG_RE = re.compile(r'\[[^\]]*\]')
PAUSE = 1.5
BREAK_RE = re.compile(r'<break\s+time="([\d.]+)s"\s*/>')
SPK_RE = re.compile(r'^@(\w+):\s*(.*)$')


def parse_events(text):
    events = []
    cur_spk, cur_txt = None, []

    def flush_seg():
        nonlocal cur_spk, cur_txt
        if cur_spk and cur_txt:
            _emit_segment(cur_spk, " ".join(cur_txt).strip(), events)
        cur_spk, cur_txt = None, []

    for raw in text.splitlines():
        s = raw.strip()
        m = SPK_RE.match(s)
        if m:
            flush_seg()
            cur_spk, cur_txt = m.group(1), [m.group(2)]
        elif s.startswith("[[") or s == "":
            flush_seg()
            for dur in BREAK_RE.findall(s):
                events.append(("silence", float(dur)))
        elif cur_spk:
            cur_txt.append(s)
    flush_seg()
    return events


def _emit_segment(speaker, text, events):
    if not text:
        return
    parts = BREAK_RE.split(text)   # [text, dur, text, ...]
    for i, part in enumerate(parts):
        if i % 2 == 1:
            events.append(("silence", float(part)))
        else:
            t = part.strip()
            if re.search(r'[A-Za-z]', t.replace("[", " ").replace("]", " ")):
                events.append(("speech", speaker, t))


def coalesce(events, max_chars=COALESCE_MAX):
    """Merge consecutive same-speaker speech (no silence between) into one render."""
    out = []
    for ev in events:
        if (ev[0] == "speech" and out and out[-1][0] == "speech"
                and out[-1][1] == ev[1]
                and len(out[-1][2]) + len(ev[2]) + 1 <= max_chars):
            out[-1] = ("speech", ev[1], out[-1][2] + " " + ev[2])
        else:
            out.append(ev)
    return out


def render_speech(client, speaker, text, out_path, tries=4):
    cfg = ROLES.get(speaker, ROLES["_default"])
    vid = CAST.get(speaker, CAST["NARRATOR"])
    clean = TAG_RE.sub("", text).strip()
    send = clean if cfg["strip"] else text
    # v3 drop-guard: expect ~1000 bytes/char; retry if a longish seg comes back tiny.
    floor = MIN_BYTES_PER_CHAR * len(clean) if (cfg["model"] == V3 and len(clean) > 80) else 0
    best, last = b"", None
    for attempt in range(1, tries + 1):
        try:
            audio = client.text_to_speech.convert(
                voice_id=vid, model_id=cfg["model"], text=send, voice_settings=cfg["vs"])
            data = b"".join(x for x in audio)
            if len(data) > len(best):
                best = data
            if data and len(data) >= floor:
                out_path.write_bytes(data)
                return len(data)
            last = f"short {len(data)}b < floor {floor}b (possible drop)"
        except Exception as e:
            last = str(e)
        if attempt < tries:
            time.sleep(attempt * 6)
    if best:
        out_path.write_bytes(best)
        return len(best)
    raise RuntimeError(f"tts failed ({speaker}): {last}")


def make_silence(seconds, out_path):
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
         "-t", f"{seconds:.2f}", "-c:a", "libmp3lame", "-b:a", "128k", str(out_path)],
        check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key:
        sys.exit("ERROR: ELEVENLABS_API_KEY not set (source ../../.env)")
    from elevenlabs.client import ElevenLabs
    client = ElevenLabs(api_key=key)

    script_path = Path(args.script)
    events = coalesce(parse_events(script_path.read_text()))
    if args.limit:
        out, n = [], 0
        for ev in events:
            out.append(ev)
            if ev[0] == "speech":
                n += 1
                if n >= args.limit:
                    break
        events = out

    book = script_path.parent.parent
    audio_dir = book / "audio"; audio_dir.mkdir(exist_ok=True)
    stem = script_path.stem.replace(".audio", "")
    out_mp3 = Path(args.out) if args.out else audio_dir / f"{stem}.mp3"

    tmp = Path(tempfile.mkdtemp(prefix="mndc_"))
    parts, idx, calls = [], 0, 0
    speech = [e for e in events if e[0] == "speech"]
    total_chars = sum(len(e[2]) for e in speech)
    print(f"{script_path.name}: {len(speech)} speech events, ~{total_chars} chars → rendering...")

    for ev in events:
        idx += 1
        if ev[0] == "silence":
            p = tmp / f"sil_{idx:03d}.mp3"
            make_silence(ev[1], p)
            parts.append(p)
        else:
            _, spk, txt = ev
            p = tmp / f"seg_{idx:03d}.mp3"
            calls += 1
            print(f"  [{calls}/{len(speech)}] {spk:8} {len(txt):4}c...", end="", flush=True)
            n = render_speech(client, spk, txt, p)
            print(f" ok ({n:,}b)")
            parts.append(p)
            time.sleep(PAUSE)

    listing = tmp / "list.txt"
    listing.write_text("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
         "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "1", str(out_mp3)],
        check=True, capture_output=True)
    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nk=1:nw=1", str(out_mp3)], capture_output=True, text=True).stdout.strip()
    mb = out_mp3.stat().st_size / (1024 * 1024)
    print(f"\nDONE → {out_mp3}")
    print(f"  {calls} calls · ~{total_chars} chars · {mb:.1f} MB · {float(dur):.0f}s (~{float(dur)/60:.1f} min)")


if __name__ == "__main__":
    main()
