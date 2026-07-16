#!/usr/bin/env python3
"""
apply_score.py — stamp section-score cue markers into the episode scripts so a
listener can hear when a new section begins. See audiobook/SCORE.md for the design.

Under every recognized `## [SECTION]` header it inserts one blockquote cue line:
    > ♪ **SCORE — LABEL** · <transition in> · <bed> · <out>
The narrator does not read it; the mix lays the cue at that point. Idempotent:
re-running never duplicates a marker, and it updates a marker if the canonical
text changed.

Usage (from books/digital-insurgency/):
    python3 audiobook/apply_score.py                # stamp all audiobook/scripts/ep_*.md
    python3 audiobook/apply_score.py ep_05          # one script (with or without .md)
    python3 audiobook/apply_score.py --check        # exit 1 if any section is unmarked
"""
import re
import sys
from pathlib import Path

SCRIPTS = Path(__file__).parent / "scripts"
MARKER = "> ♪ **SCORE —"

# (matcher on the text inside the [...] header, checked in order) -> cue line body.
# First match wins, so put specific prefixes before generic ones.
CUES = [
    ("SIGNAL IN",
     "**SCORE — SIGNAL IN** · shortwave tune-in sweep + static burst → DI theme motif (~4s) · theme tail ducks under the first line · hard cut to the Broadcast."),
    ("COLD OPEN",
     "**SCORE — BROADCAST** · downward \"dive\" whoosh into the scene · server-room bed (50–60 Hz hum + sparse synth pad + distant city) at −18 dB under the whole scene · pull the bed on the last line."),
    ("THE LESSON",
     "**SCORE — LESSON** · hard cut, bed drops out, physics pulse starts (dry, close, no reverb) · a rising data-stinger blip on each equation named · pulse stops cold at the section end."),
    ("DISPATCH",
     "**SCORE — DISPATCH** · teletype/dial burst + a location stinger · light per-vertical procedural bed; physics pulse returns for the math · stinger + silence before the next dispatch."),
    ("THE CHEATSHEET",
     "**SCORE — BRIEFING** · steady briefing bed (soft tick + pad) · a data-stinger per equation as it's named · soft fade out."),
    ("THE INFILTRATION CANVAS",
     "**SCORE — BRIEFING** · briefing bed continues · a page-turn click between each Canvas field · soft fade out."),
    ("THE SPZ CLOSER",
     "**SCORE — CLOSER** · everything drops; a warm chord blooms (the \"sit-down\" cue) · confessional bed: vinyl crackle + lone Rhodes + Waffle-House room tone · crackle holds under the last word."),
    ("FIELD ASSIGNMENT",
     "**SCORE — ASSIGNMENT** · one decisive percussive hit + a rising two-note \"go\" figure · short punchy CTA motif (~10–15s) · button, then silence."),
    ("SIGNAL OUT",
     "**SCORE — SIGNAL OUT** · DI theme motif reprise, now resolved · radio-off click → static fade → silence."),
]
GENERIC = "**SCORE — SECTION** · boundary SFX (shortwave re-tune chirp) + ~0.6s near-silence · new bed enters (see audiobook/SCORE.md)."

HEADER_RE = re.compile(r"^\s*##\s*\[(?P<inner>.+?)\]\s*$")


def cue_for(inner: str) -> str:
    up = inner.upper()
    for key, body in CUES:
        if up.startswith(key):
            return body
    return GENERIC


def process(text: str):
    """Return (new_text, n_headers, n_changed)."""
    lines = text.splitlines()
    out, i = [], 0
    n_headers = n_changed = 0
    while i < len(lines):
        line = lines[i]
        m = HEADER_RE.match(line)
        out.append(line)
        if m:
            n_headers += 1
            want = "> ♪ " + cue_for(m.group("inner"))
            # Is the immediately-following non-blank line an existing marker?
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            has_marker = j < len(lines) and lines[j].lstrip().startswith(MARKER)
            if has_marker:
                if lines[j].strip() != want.strip():
                    lines[j] = want  # refresh stale cue text in place
                    n_changed += 1
            else:
                out.append("")
                out.append(want)
                n_changed += 1
        i += 1
    new = "\n".join(out)
    if text.endswith("\n") and not new.endswith("\n"):
        new += "\n"
    return new, n_headers, n_changed


def main():
    args = [a for a in sys.argv[1:] if a != "--check"]
    check = "--check" in sys.argv
    if args:
        targets = []
        for a in args:
            stem = a[:-3] if a.endswith(".md") else a
            targets.append(SCRIPTS / f"{stem}.md")
    else:
        targets = sorted(SCRIPTS.glob("ep_*.md"))

    if not targets:
        print("no scripts found in", SCRIPTS)
        sys.exit(1)

    total_headers = total_unmarked = total_changed = 0
    for p in targets:
        if not p.exists():
            print(f"  ! missing: {p.name}")
            continue
        text = p.read_text()
        new, n_headers, n_changed = process(text)
        total_headers += n_headers
        if check:
            # count headers still lacking a marker after a dry pass
            _, _, would_change = process(text)
            total_unmarked += would_change
            flag = "" if would_change == 0 else f"  <-- {would_change} unmarked"
            print(f"  {p.name}: {n_headers} sections{flag}")
        else:
            if n_changed:
                p.write_text(new)
            total_changed += n_changed
            print(f"  {p.name}: {n_headers} sections, {n_changed} cue(s) stamped/updated")

    if check:
        if total_unmarked:
            print(f"CHECK FAILED: {total_unmarked} section(s) missing a score marker.")
            sys.exit(1)
        print(f"CHECK OK: all {total_headers} sections scored.")
    else:
        print(f"done: {total_headers} sections across {len(targets)} script(s), "
              f"{total_changed} cue(s) stamped/updated.")


if __name__ == "__main__":
    main()
