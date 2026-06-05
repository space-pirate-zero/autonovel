#!/usr/bin/env python3
"""
build_pdf.py -- Render the full book (Prologue + 16 chapters + 3 appendices)
to a clean PDF via pandoc + tectonic.

This book is a technical manual: it contains LaTeX math ($$...$$), pipe tables,
and code fences. The repo's typeset/build_tex.py is a prose-fiction converter
that escapes '$' and mangles tables, so we use pandoc (native math/tables) with
the tectonic XeTeX engine instead.

Requires: pandoc, tectonic  (brew install pandoc tectonic)
Usage:    uv run python build_pdf.py
Output:   build/Digital_Insurgency.pdf
"""
import subprocess
from pathlib import Path

BASE = Path(__file__).parent
BUILD = BASE / "build"
BUILD.mkdir(exist_ok=True)

# Unicode the LaTeX (Latin Modern) fonts can't render -> safe equivalents.
REPL = {
    "\U0001F7E2": "GREEN", "\U0001F7E1": "YELLOW", "\U0001F534": "RED",
    "\U0001F3F4": "", "‍": "", "☠": "", "️": "",
    "\U0001F389": "", "\U0001F3C1": "", "\U0001F37A": "",
    "→": "->", "∞": "infinity", "≤": "<=", "≥": ">=",
    "×": "x", "²": "^2", "≈": "~", "·": "|", "✓": "yes",
    "—": "---", "–": "--",
    # box-drawing / arrows from ASCII diagrams
    "─": "-", "│": "|", "┌": "+", "┐": "+", "└": "+",
    "┘": "+", "├": "+", "┤": "+", "┬": "+", "┴": "+",
    "┼": "+", "▼": "v", "▲": "^", "◄": "<", "►": ">",
}


def clean(text: str) -> str:
    out = []
    for line in text.split("\n"):
        if line.strip().startswith("[IMG"):   # drop art-direction markers
            continue
        for k, v in REPL.items():
            line = line.replace(k, v)
        out.append(line)
    return "\n".join(out)


def main():
    parts = []
    for n in range(0, 20):  # ch_00 (Prologue) .. ch_19 (Appendix C)
        p = BASE / "chapters" / f"ch_{n:02d}.md"
        if p.exists():
            parts.append(clean(p.read_text().strip()))
    meta = (
        "---\n"
        'title: "Digital Insurgency"\n'
        'subtitle: "A Field Manual for Smuggling Authenticity Past the '
        'Corporate Immune System"\n'
        'author: "Space Pirate Zero"\n'
        'date: "Spaceship Alpha 9, LLC --- 2027"\n'
        "---\n\n"
    )
    src = BUILD / "digital_insurgency.md"
    src.write_text(meta + "\n\n".join(parts) + "\n")
    words = sum(len(p.split()) for p in parts)
    print(f"Source: {src}  ({words:,} words, {len(parts)} sections)")

    pdf = BUILD / "Digital_Insurgency.pdf"
    cmd = [
        "pandoc", str(src), "-o", str(pdf),
        "--pdf-engine=tectonic", "--toc", "--toc-depth=2",
        "--top-level-division=chapter",
        "-V", "documentclass=book", "-V", "geometry:margin=1in",
        "-V", "fontsize=11pt", "-V", "colorlinks=true", "-V", "linkcolor=black",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    # tectonic warnings go to stderr; only fail on a missing output file
    if not pdf.exists():
        print(r.stderr[-2000:])
        raise SystemExit("PDF build failed")
    print(f"PDF: {pdf}  ({pdf.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
