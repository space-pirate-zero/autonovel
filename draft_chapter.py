#!/usr/bin/env python3
"""
Draft a single chapter using the writer model.
Usage: python draft_chapter.py 1
"""
import os
import re
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

WRITER_MODEL = os.environ.get("AUTONOVEL_WRITER_MODEL", "claude-opus-4-8")
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
API_BASE = os.environ.get("AUTONOVEL_API_BASE_URL", "https://api.anthropic.com")
CHAPTERS_DIR = BASE_DIR / "chapters"
BOOK_TITLE = os.environ.get("AUTONOVEL_BOOK_TITLE", "Digital Insurgency")

def call_writer(prompt, max_tokens=16000):
    import httpx
    headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "context-1m-2025-08-07",
        "content-type": "application/json",
    }
    payload = {
        "model": WRITER_MODEL,
        "max_tokens": max_tokens,
        "system": (
            "You are Space Pirate Zero (SPZ), writing a chapter of 'Digital "
            "Insurgency' -- a business-strategy x cyberpunk x spec-ops field "
            "manual. Each chapter follows a fixed format (header, glossary, "
            "SITREP, THE BROADCAST graphic-novel vignette, briefing intel "
            "blocks with equations, BOSS profile, mission tasks, glass house "
            "exercises, SPZ voice closer, end marker). You follow voice.md "
            "exactly: snarky, punk, Atlanta-trap, hacker, active voice only, "
            "banned words never. THE BROADCAST is cinematic present tense; the "
            "briefing is second-person and clinical; the SPZ closer is raw "
            "first-person. You weave the real figures from influences.md in "
            "heavily and honestly. You hit every beat in the outline and keep "
            "all canon facts. You write the FULL chapter -- never truncate or "
            "summarize."
        ),
        "messages": [{"role": "user", "content": prompt}],
    }
    resp = httpx.post(f"{API_BASE}/v1/messages", headers=headers, json=payload, timeout=600)
    if resp.status_code != 200:
        raise RuntimeError(f"API {resp.status_code}: {resp.text[:600]}")
    return resp.json()["content"][0]["text"]

def load_file(path):
    try:
        return Path(path).read_text()
    except FileNotFoundError:
        return ""

def extract_chapter_outline(outline_text, chapter_num):
    """Extract a specific chapter's outline entry."""
    pattern = rf'### Ch {chapter_num}:.*?(?=### Ch {chapter_num + 1}:|## Foreshadowing|$)'
    match = re.search(pattern, outline_text, re.DOTALL)
    return match.group(0).strip() if match else "(not found)"

def extract_next_chapter_outline(outline_text, chapter_num):
    """Extract the next chapter's outline (just first few lines for continuity)."""
    next_entry = extract_chapter_outline(outline_text, chapter_num + 1)
    if next_entry == "(not found)":
        return "(final chapter)"
    lines = next_entry.split('\n')[:10]
    return '\n'.join(lines)

def main():
    chapter_num = int(sys.argv[1])
    
    # Load all context
    voice = load_file(BASE_DIR / "voice.md")
    world = load_file(BASE_DIR / "world.md")
    characters = load_file(BASE_DIR / "characters.md")
    outline = load_file(BASE_DIR / "outline.md")
    canon = load_file(BASE_DIR / "canon.md")
    influences = load_file(BASE_DIR / "influences.md")
    seed = load_file(BASE_DIR / "seed.txt")

    # Chapter-specific context
    chapter_outline = extract_chapter_outline(outline, chapter_num)
    next_chapter = extract_next_chapter_outline(outline, chapter_num)
    
    # Previous chapter (if exists)
    prev_path = CHAPTERS_DIR / f"ch_{chapter_num - 1:02d}.md"
    if prev_path.exists():
        prev_text = prev_path.read_text()
        prev_tail = prev_text[-2000:] if len(prev_text) > 2000 else prev_text
    else:
        prev_tail = "(first chapter -- no previous)"
    
    prompt = f"""Write Chapter {chapter_num} of "{BOOK_TITLE}".

MASTER BRIEF (premise, the Five Claims, and the CHAPTER FORMAT TEMPLATE you MUST follow):
{seed}

VOICE DEFINITION (follow this exactly -- banned/required words, tone by section):
{voice}

THIS CHAPTER'S OUTLINE (hit every beat):
{chapter_outline}

NEXT CHAPTER'S OUTLINE (for continuity):
{next_chapter}

PREVIOUS CHAPTER'S ENDING (continue the arc from here):
{prev_tail}

WORLD BIBLE:
{world}

CHARACTER REGISTRY (speech patterns, visual consistency, arcs):
{characters}

CANON (hard facts + the 24 equations; never contradict these):
{canon}

INFLUENCES (weave these real figures in heavily and honestly):
{influences}

WRITING INSTRUCTIONS:
1. Write the COMPLETE chapter. Target ~3,400-3,800 words. Never truncate.
2. Follow the CHAPTER FORMAT TEMPLATE from the master brief exactly, in order:
   header, glossary (8-12 terms), SITREP (Situation/Complication/Main Point),
   THE BROADCAST (cinematic present tense, advances ZERO's arc), BRIEFING (intel
   blocks; each equation gets name, formula, variable defs, traffic-light
   benchmarks, and 2-3 worked NUMERIC field reports), BOSS profile
   (Intel/Strategy/The Pitch), KEY MISSION TASKS, GLASS HOUSE EXERCISES (3-4),
   SPZ VOICE CLOSER (raw first-person, 200-400 words), end marker.
3. Hit ALL beats from this chapter's outline. Keep ALL canon facts (colors,
   ages, ZERO's pink streak + implant scar, BISHOP's 15-20 degree crooked badge,
   GHOST always translucent, REAPER an environment never a character).
4. THE BROADCAST is present tense and cinematic. The briefing/SITREP/glass house
   are second person. The SPZ closer is first person and confessional.
5. Active voice only. No banned words (voice.md Part 1 + book-specific list).
6. Weave in at least one influences.md figure where it earns its place -- as an
   epigraph, a Broadcast beat, a briefing analogy, or an SPZ-closer anchor.
   Quote honestly; never decoration. Diogenes' "deface the currency" is the spine.
7. Vary sentence length. Short for impact, long for rhythm, never medium for
   nothing. No triadic lists by default. No em-dash overload.
8. Surprise at least once. Predictable excellence is still predictable.
9. Dialogue sounds like speech -- people stumble, interrupt, trail off. GHOST's
   words float in mono (no bubble); REAPER speaks only as system notifications.
10. End the chapter in a way that belongs to THIS chapter, not a reused move.

Write the chapter now. Full text, beginning to end.
"""

    print(f"Drafting Chapter {chapter_num}...", file=sys.stderr)
    result = call_writer(prompt)
    
    # Save
    out_path = CHAPTERS_DIR / f"ch_{chapter_num:02d}.md"
    out_path.write_text(result)
    print(f"Saved to {out_path}", file=sys.stderr)
    print(f"Word count: {len(result.split())}", file=sys.stderr)
    print(result)

if __name__ == "__main__":
    main()
