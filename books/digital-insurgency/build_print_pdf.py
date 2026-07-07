#!/usr/bin/env python3
"""
build_print_pdf.py -- Paperback interior: 6x9, black-ink, embedded fonts, for KDP
print. Monochrome variant of the design (black banner bars, framed equations,
bold B&W benchmarks). Mirror margins (twoside) for the binding gutter.

Usage:  uv run python build_print_pdf.py
Output: build/Digital_Insurgency_Paperback_6x9.pdf
"""
import re
import subprocess
from pathlib import Path

BASE = Path(__file__).parent
BUILD = BASE / "build"
BUILD.mkdir(exist_ok=True)

# B&W: traffic-light words become bold (bright colors would print near-invisible)
REPL = {
    "\U0001F7E2": "\\textbf{GREEN}", "\U0001F7E1": "\\textbf{YELLOW}",
    "\U0001F534": "\\textbf{RED}",
    "\U0001F3F4": "", "‍": "", "☠": "", "️": "",
    "\U0001F389": "", "\U0001F3C1": "", "\U0001F37A": "", "\U0001F4D5": "",
    "→": "->", "∞": "infinity", "≤": "<=", "≥": ">=",
    "×": "x", "²": "^2", "≈": "~", "·": "|", "✓": "yes",
    "—": "---", "–": "--",
    "─": "-", "│": "|", "┌": "+", "┐": "+", "└": "+",
    "┘": "+", "├": "+", "┤": "+", "┬": "+", "┴": "+",
    "┼": "+", "▼": "v", "▲": "^", "◄": "<", "►": ">",
}

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


def clean(text):
    out = []
    for line in text.split("\n"):
        if line.strip().startswith("[IMG"):
            continue
        for k, v in REPL.items():
            line = line.replace(k, v)
        out.append(line)
    return "\n".join(out)


def tex_arg(s):
    s = s.replace("\\", " ")
    for ch in "#$%&_{}":
        s = s.replace(ch, "\\" + ch)
    return s.replace("^", "\\^{}").replace("~", "\\~{}")


def main():
    blocks = []
    for n in range(0, 20):
        p = BASE / "chapters" / f"ch_{n:02d}.md"
        if not p.exists():
            continue
        label, title, subtitle, body = parse_chapter(p.read_text())
        label, title = clean(label), clean(title)
        subtitle, body = clean(subtitle), clean(body)
        opener = ("```{=latex}\n\\dichapter{%s}{%s}{%s}\n```\n"
                  % (tex_arg(label or title), tex_arg(title or label), tex_arg(subtitle)))
        blocks.append(opener + "\n" + body)

    src = BUILD / "digital_insurgency_print.md"
    src.write_text("\n\n".join(blocks) + "\n")
    print(f"Source: {src}")

    pdf = BUILD / "Digital_Insurgency_Paperback_6x9.pdf"
    cmd = [
        "pandoc", str(src), "-o", str(pdf),
        "--pdf-engine=tectonic",
        "-H", str(BASE / "design" / "preamble_print.tex"),
        "-B", str(BASE / "design" / "cover_print.tex"),
        "--lua-filter", str(BASE / "design" / "sections.lua"),
        "--highlight-style", "kate",
        "-V", "documentclass=book", "-V", "classoption=twoside",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if not pdf.exists():
        print("STDERR (tail):\n" + r.stderr[-3000:])
        raise SystemExit("paperback build failed")
    print(f"PDF: {pdf}  ({pdf.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
