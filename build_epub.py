#!/usr/bin/env python3
"""
build_epub.py -- Build a styled INSURGENT ePub (dark theme, embedded fonts,
color-coded section banners, MathML equations, cover rendered from the PDF).

Requires: pandoc (and poppler's pdftoppm for the cover, optional).
Usage:    uv run python build_epub.py
Output:   build/Digital_Insurgency.epub
"""
import re
import subprocess
from pathlib import Path

BASE = Path(__file__).parent
BUILD = BASE / "build"
BUILD.mkdir(exist_ok=True)
HOLD = BASE / ".polish_hold"           # appendices may be parked here mid-polish

SECTION_KEYS = ("GLOSSARY", "SITREP", "THE BROADCAST", "BROADCAST", "BRIEFING",
                "BOSS", "KEY MISSION TASKS", "MISSION TASKS", "GLASS HOUSE",
                "SPACE PIRATE ZERO", "SPZ", "THE MIRROR TEST",
                "THE INSURGENT", "INTEL BLOCK")
LABEL_RE = re.compile(r'^(PROLOGUE|CHAPTER\s+\d+|APPENDIX\s+[A-Z])'
                      r'(?:\s*[:\-]\s*(.*))?$', re.I)


def heading_text(s):
    if s.startswith("**") and s.endswith("**"):
        return s.strip("*").strip()
    if s.startswith("#"):
        return s.lstrip("#").strip()
    if s.startswith("*") and s.endswith("*"):
        return s.strip("*").strip()
    return None


def is_section(t):
    u = t.upper().lstrip("[").rstrip("]")
    return any(u == k or u.startswith(k + " ") or u.startswith(k + ":")
              for k in SECTION_KEYS)


def parse_chapter(text):
    lines = text.split("\n")
    collected, j = [], 0
    while j < len(lines):
        s = lines[j].strip()
        if s == "":
            j += 1
            continue
        ht = heading_text(s)
        if ht is None or is_section(ht):
            break
        collected.append((s, ht))
        j += 1
    label = title = subtitle = ""
    for s, t in collected:
        if s.startswith("*") and not s.startswith("**") and s.endswith("*"):
            subtitle = subtitle or t
            continue
        m = LABEL_RE.match(t)
        if m and not label:
            label = m.group(1).upper()
            if m.group(2) and not title:
                title = m.group(2).strip()
            continue
        if not title:
            title = t
        elif not subtitle:
            subtitle = t
    body = "\n".join(lines[j:]).strip()
    body = re.sub(r'^(---\s*\n)+', '', body)
    return label, title, subtitle, body


def strip_img(text):
    return "\n".join(l for l in text.split("\n")
                     if not l.strip().startswith("[IMG"))


def chapter_path(n):
    p = BASE / "chapters" / f"ch_{n:02d}.md"
    if p.exists():
        return p
    h = HOLD / f"ch_{n:02d}.md"
    return h if h.exists() else None


def main():
    blocks = []
    for n in range(0, 20):
        p = chapter_path(n)
        if not p:
            continue
        label, title, subtitle, body = parse_chapter(p.read_text())
        head = (label + ": " + title) if (label and title) else (title or label)
        chunk = "# " + head + "\n\n"
        if subtitle:
            chunk += "*" + subtitle + "*\n\n"
        chunk += strip_img(body)
        blocks.append(chunk)

    import sys
    kindle = "--kindle" in sys.argv
    css_file = "epub_kindle.css" if kindle else "epub.css"
    out_name = "Digital_Insurgency_Kindle.epub" if kindle else "Digital_Insurgency.epub"

    src = BUILD / "digital_insurgency_epub.md"
    src.write_text("\n\n".join(blocks) + "\n")
    print(f"Source: {src}  ({len(blocks)} sections)  [{'KINDLE' if kindle else 'deluxe'}]")

    # Cover: render page 1 of the designed PDF if available + pdftoppm present.
    cover = BUILD / "cover.png"
    designed = BUILD / "Digital_Insurgency_Designed.pdf"
    cover_args = []
    if designed.exists() and subprocess.run(["which", "pdftoppm"],
                                            capture_output=True).returncode == 0:
        subprocess.run(["pdftoppm", "-png", "-r", "200", "-f", "1", "-l", "1",
                        "-singlefile", str(designed), str(BUILD / "cover")],
                       capture_output=True)
        if cover.exists():
            cover_args = ["--epub-cover-image", str(cover)]
            print(f"Cover: {cover}")

    fonts = ["Orbitron-900", "Orbitron-700", "SpaceGrotesk-400",
             "SpaceGrotesk-700", "JetBrainsMono-400"]
    embed = []
    for f in fonts:
        embed += ["--epub-embed-font", str(BASE / "fonts" / (f + ".ttf"))]

    epub = BUILD / out_name
    cmd = [
        "pandoc", str(src), "-o", str(epub),
        "--to", "epub3", "--mathml",
        "--css", str(BASE / "design" / css_file),
        "--lua-filter", str(BASE / "design" / "epub_sections.lua"),
        "--toc", "--toc-depth=1", "--split-level=1",
        "-M", "title=Digital Insurgency",
        "-M", "subtitle=A Field Manual for Smuggling Authenticity Past the Corporate Immune System",
        "-M", "author=Space Pirate Zero",
        "-M", "lang=en-US", "-M", "date=2026",
        "-M", "publisher=Spaceship Alpha 9, LLC",
    ] + cover_args + embed
    r = subprocess.run(cmd, capture_output=True, text=True)
    if not epub.exists():
        print("STDERR:\n" + r.stderr[-3000:])
        raise SystemExit("epub build failed")
    print(f"ePub: {epub}  ({epub.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
