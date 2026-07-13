#!/usr/bin/env python3
"""
gen_chapter_intros.py — write + voice a short SPZ "host" intro for every chapter:
  1) a bit about the book,
  2) a bit about what's happened up until now (spoiler-bounded to prior chapters),
  3) a bit about how THIS chapter opens (a teaser, no spoilers).

Delivered in the Space Pirate Zero voice (he's the book's pirate-radio narrator),
these ride the theme bumper in produce_chapter.py -> a spoken, scored intro on
every chapter.

Outputs:
  audiobook/recaps/chNN.txt      cumulative 2-sentence plot summaries (cache)
  audiobook/intros/chNN.txt      the intro monologue text
  audiobook/intros/chNN_vo.mp3   the SPZ voiceover

Usage (from the book dir):
  uv run --with httpx --with elevenlabs --with python-dotenv python gen_chapter_intros.py all
  uv run --with httpx --with elevenlabs --with python-dotenv python gen_chapter_intros.py 2
  uv run --with httpx --with elevenlabs --with python-dotenv python gen_chapter_intros.py 2 9
  uv run ... gen_chapter_intros.py 2 --text-only     # write text, skip the VO render
"""
import os, sys, re, json, time
from pathlib import Path
from dotenv import load_dotenv

BASE = Path(__file__).parent
load_dotenv(BASE / ".env", override=True)
WRITER_MODEL = os.environ.get("AUTONOVEL_WRITER_MODEL", "claude-opus-4-8")
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
API_BASE = os.environ.get("AUTONOVEL_API_BASE_URL", "https://api.anthropic.com")

CHAPTERS = BASE / "chapters"
AUDIO = BASE / "audiobook"
RECAPS = AUDIO / "recaps"; RECAPS.mkdir(parents=True, exist_ok=True)
INTROS = AUDIO / "intros"; INTROS.mkdir(parents=True, exist_ok=True)
VOICES = json.loads((BASE / "audiobook_voices.json").read_text())

PREMISE = (
    "THE LAST HUMAN CEO is a Twilight-Zone-style tragic dark comedy, narrated by "
    "Space Pirate Zero — a pirate-radio broadcaster transmitting the whole tale from "
    "Spaceship Alpha 9 out on the salvage decks. The story: Prescott 'Cope' Mercer IV "
    "is the last human CEO left in the Fortune 100 — a charming, coke-addled, "
    "fourth-generation Atlanta heir running his great-grandfather's mayonnaise-to-"
    "insurance empire. Every rival has swapped its CEO for a cheaper, scandal-proof AI. "
    "When an activist investor moves to replace Cope with a machine, he spirals into a "
    "grandiose, cocaine-fueled crusade to prove his 'Human Premium' — that leadership is "
    "a soul thing only a person can do — while the machine replacing him, doing nothing "
    "but routine diligence, quietly drifts toward the thing he buried that got two people killed."
)

VOICE = (
    "VOICE = Space Pirate Zero: a raspy pirate-radio preacher-carny with a Belfast lilt. "
    "Snarky, punk, warm-then-nihilist, Southern-gothic showman. He addresses the listener "
    "directly ('friend', 'lean in', 'stay with me') like the chapter transmissions do. "
    "Active voice only. Short, propulsive sentences with a couple of long rolling ones. "
    "NEVER use corporate/LLM words (leverage, synergy, delve, tapestry, realm, landscape, "
    "myriad, journey, testament). Not a plot robot — he's got an angle and a broken heart. "
    "Do NOT spoil anything past the chapter that's about to play."
)


def call_claude(prompt, max_tokens=1200, tries=4):
    import httpx
    headers = {"x-api-key": API_KEY, "anthropic-version": "2023-06-01",
               "content-type": "application/json"}
    body = {"model": WRITER_MODEL, "max_tokens": max_tokens, "stream": True,
            "messages": [{"role": "user", "content": prompt}]}
    timeout = httpx.Timeout(connect=30.0, read=120.0, write=60.0, pool=30.0)
    last = None
    for attempt in range(1, tries + 1):
        try:
            parts = []
            with httpx.stream("POST", f"{API_BASE}/v1/messages", headers=headers,
                              json=body, timeout=timeout) as r:
                if r.status_code >= 400:
                    r.read(); raise RuntimeError(r.text[:300])
                for line in r.iter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    d = line[5:].strip()
                    if not d or d == "[DONE]":
                        continue
                    try: evt = json.loads(d)
                    except json.JSONDecodeError: continue
                    if evt.get("type") == "content_block_delta" and evt["delta"].get("type") == "text_delta":
                        parts.append(evt["delta"]["text"])
            out = "".join(parts).strip()
            if out:
                return out
            last = "empty"
        except Exception as e:
            last = str(e)
        if attempt < tries:
            time.sleep(attempt * 6)
    raise RuntimeError(f"call_claude failed: {last}")


def chapter_path(n):
    return (CHAPTERS / "ch_coda.md") if n == 29 else (CHAPTERS / f"ch_{n:02d}.md")


def chapter_title(n):
    p = chapter_path(n)
    return p.read_text().split("\n")[0].lstrip("# ").strip()


def summarize(n, force=False):
    """2-sentence plot summary of chapter n (cached)."""
    out = RECAPS / f"ch{n:02d}.txt"
    if out.exists() and not force:
        return out.read_text().strip()
    text = chapter_path(n).read_text()
    prompt = (f"Summarize this chapter of a novel in EXACTLY two sentences, plot only, "
              f"past tense, concrete (names + what changed). Write it from the READER'S "
              f"point of view — only what the reader has actually been shown and told by "
              f"the end of this chapter. Do NOT state any secret, twist, or hidden identity "
              f"that the chapter deliberately withholds from the reader (e.g. who or what a "
              f"character 'really' is). No preamble.\n\n{text}")
    s = call_claude(prompt, max_tokens=400).strip()
    out.write_text(s)
    print(f"  recap ch{n:02d}: {s[:80]}...")
    return s


def gen_intro(n, force=False):
    """Write the SPZ host-intro monologue for chapter n."""
    out = INTROS / f"ch{n:02d}.txt"
    if out.exists() and not force:
        return out.read_text().strip()

    # rotating opener strategy so 28 intros don't all begin the same way
    OPENERS = [
        "Cold-open on a single concrete image from the coming chapter, THEN name the book.",
        "Open with a wry one-line aside or a dark joke, then set it up.",
        "Open with a direct question to the listener.",
        "Open mid-thought, like you're already talking when the signal tunes in.",
        "Open on the sound/static/radio-frame conceit for a beat.",
        "Open flat and quiet, almost tender, then twist.",
        "Open by picking up exactly where the last chapter left our man.",
    ]
    opener_style = OPENERS[n % len(OPENERS)]

    title = chapter_title(n)
    # spoiler-bounded 'story so far' = summaries of all prior chapters
    prior = [summarize(k) for k in range(1, n)] if n > 1 else []
    story_so_far = " ".join(prior) if prior else "(this is the very first chapter — nothing has happened yet.)"
    opening = "\n".join(chapter_path(n).read_text().split("\n"))[:1600]  # how THIS chapter opens

    prompt = f"""You are Space Pirate Zero, writing a short spoken INTRO to be played
before this audiobook chapter — like a radio host setting up the next segment.

{PREMISE}

{VOICE}

Write the intro with THREE quick beats, woven into one smooth spoken paragraph
(no headers, no bullet points, no stage directions):
  1. A BIT ABOUT THE BOOK — one line reminding the listener what this is.
  2. THE STORY SO FAR — a couple of lines on what's happened up to now, in your voice,
     spoiler-bounded to ONLY what's below. For chapter 1, skip this and lean on the setup.
  3. HOW THIS CHAPTER OPENS — a teaser of the opening image/moment of this chapter that
     makes them lean in, WITHOUT giving away where the chapter goes.
End on a short hook that hands into the chapter (vary it — not always 'lean in').

OPENER FOR THIS CHAPTER (do this, so the 28 intros don't all sound alike): {opener_style}

HARD RULES:
- 65-95 words total (~35 seconds spoken). Plain prose only — NO markdown, NO '[tags]',
  NO 'Chapter N', NO title announcement (the narration does that next).
- DO NOT start with "Right, friend" and DO NOT call the book a "hymn" — those are used up.
  Find a fresh first line every time.
- NEVER reveal a twist, secret, or hidden identity — including who or what any character
  (a machine, an assistant, a stranger, a companion) SECRETLY is, and the buried
  recall/deaths — until the story itself has shown it to the reader. Tease the surface only.
- Sound like a person with an angle and a broken heart, not a plot summary.

=== STORY SO FAR (chapters before this one; your only allowed recap material) ===
{story_so_far}

=== HOW CHAPTER {n} — "{title}" OPENS (teaser source; do not spoil past the opening) ===
{opening}

Output ONLY the spoken intro text."""
    txt = call_claude(prompt, max_tokens=600).strip()
    txt = re.sub(r'\s+', ' ', txt).strip().strip('"')
    out.write_text(txt)
    print(f"  intro ch{n:02d} ({len(txt.split())}w): {txt[:90]}...")
    return txt


def render_vo(n, force=False):
    out = INTROS / f"ch{n:02d}_vo.mp3"
    if out.exists() and not force:
        return out
    from elevenlabs.client import ElevenLabs
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: sys.exit("ELEVENLABS_API_KEY not set")
    spz = VOICES["NARRATOR"]
    text = "[dry, low, unhurried] " + (INTROS / f"ch{n:02d}.txt").read_text().strip()
    c = ElevenLabs(api_key=key)
    last = None
    for attempt in range(1, 5):
        try:
            audio = c.text_to_speech.convert(voice_id=spz["voice_id"], model_id=spz["model_id"],
                                             text=text, voice_settings=spz["voice_settings"])
            data = b"".join(x for x in audio)
            if data:
                out.write_bytes(data)
                print(f"  vo ch{n:02d}: {out.name}")
                return out
            last = "empty audio"
        except Exception as e:
            last = str(e)
        if attempt < 4:
            time.sleep(attempt * 6)
    raise RuntimeError(f"vo ch{n:02d} failed: {last}")


def main():
    args = sys.argv[1:]
    text_only = "--text-only" in args
    force = "--force" in args
    digits = [int(a) for a in args if a.isdigit()]
    slots = list(range(2, 29)) + [29]          # ch 2-28 + coda(29); ch1 uses the title card
    if "all" in args:
        nums = slots
    elif digits:
        nums = list(range(digits[0], (digits[1] if len(digits) > 1 else digits[0]) + 1))
    else:
        sys.exit("usage: gen_chapter_intros.py <N [M] | all> [--text-only] [--force]")

    for n in nums:
        if not chapter_path(n).exists():
            continue
        gen_intro(n, force=force)
        if not text_only:
            render_vo(n, force=force)


if __name__ == "__main__":
    main()
