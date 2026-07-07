#!/usr/bin/env python3
"""
Derive the prose chapter (ch_NN.md) from the tagged audio script (ch_NN.audio.md).

Strips @SPEAKER labels, [delivery] tags, <break> tags, and [[crew]] cues; turns
scene-break cues (needle lift / sting) into "— · —"; wraps non-narrator lines in
quotes. Keeps prose and recording script in sync without hand-editing twice.

Usage: python tools/detag.py chapters/ch_02.audio.md chapters/ch_02.md
"""
import re, sys
from pathlib import Path

TAG = re.compile(r'\[[^\]]*\]')
BREAK = re.compile(r'<break[^>]*>')
SPK = re.compile(r'^@(\w+):\s*(.*)$')
HEAD = re.compile(r'EPISODE\s+(\d+)\s+—\s+"([^"]+)"')


def clean(t):
    return re.sub(r'\s+', ' ', BREAK.sub('', TAG.sub('', t))).strip()


def main():
    inp, out = Path(sys.argv[1]), Path(sys.argv[2])
    lines = inp.read_text().splitlines()
    title = None
    for l in lines:
        m = HEAD.search(l)
        if m:
            title = f"Episode {m.group(1)} — {m.group(2)}"
            break

    paras, cur_spk, cur = [], None, []

    def flush():
        nonlocal cur_spk, cur
        if cur_spk and cur:
            t = clean(" ".join(cur))
            if t:
                paras.append(t if cur_spk == "NARRATOR" else f'"{t}"')
        cur_spk, cur = None, []

    for raw in lines:
        s = raw.strip()
        m = SPK.match(s)
        if m:
            flush(); cur_spk, cur = m.group(1), [m.group(2)]
        elif s.startswith("[["):
            flush()
            low = s.lower()
            if ("needle lift" in low or "sting" in low) and paras and paras[-1] != "— · —":
                paras.append("— · —")
        elif s == "":
            flush()
        elif cur_spk:
            cur.append(s)
    flush()

    while paras and paras[0] == "— · —":
        paras.pop(0)
    while paras and paras[-1] == "— · —":
        paras.pop()

    sub = None
    m = re.search(r'Season\s+\w+:[^\]]*', "\n".join(lines))
    header = f"# {title or inp.stem}\n\n*The Maneki Neko Death Cult*\n\n---\n\n"
    out.write_text(header + "\n\n".join(paras) + "\n")
    print(f"{out}  ·  {len(paras)} paragraphs  ·  ~{sum(len(p.split()) for p in paras)} words")


if __name__ == "__main__":
    main()
