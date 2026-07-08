#!/usr/bin/env python3
"""Render one branded hero card (PNG, 1456x820) per day -> substack/cards/day_NN.png.
Requires tectonic + pdftoppm. Run: uv run python substack/build_cards.py"""
import os, sys, subprocess
from pathlib import Path
HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from series_data import SERIES                                    # noqa
FONTS = HERE.parent / "fonts"
CARDS = HERE / "cards"; CARDS.mkdir(exist_ok=True)

PRE = r"""\documentclass{article}
\usepackage[paperwidth=12.13in,paperheight=6.83in,margin=0.55in]{geometry}
\usepackage{fontspec}\usepackage{xcolor}\usepackage{amsmath}\usepackage{adjustbox}
\pagestyle{empty}
\definecolor{void}{HTML}{030303}\definecolor{pink}{HTML}{FF1493}
\definecolor{cyan}{HTML}{00F0FF}\definecolor{paper}{HTML}{E8E8E8}
\definecolor{panel}{HTML}{0E0E16}\definecolor{muted}{HTML}{8A90A0}
\pagecolor{void}\color{paper}
\everymath{\color{cyan}}\everydisplay{\color{cyan}}
\newfontfamily\disp{Orbitron-900.ttf}[Path=FP]
\newfontfamily\dispS{Orbitron-700.ttf}[Path=FP]
\setmainfont{SpaceGrotesk-400.ttf}[Path=FP]
\begin{document}
""".replace("FP", str(FONTS) + "/")

def card(d):
    title = d["title"].upper().replace("&", r"\&")
    eq = (r"{\setlength{\fboxsep}{13pt}\setlength{\fboxrule}{1.2pt}"
          r"\fcolorbox{cyan}{panel}{\adjustbox{max width=0.9\linewidth}{$\displaystyle "
          + d["eq"] + r"$}}}\par\vspace{22pt}") if d.get("eq") else r"\vspace{4pt}"
    return (
        r"\begin{center}\vspace*{\fill}" "\n"
        r"{\dispS\color{cyan}\Large DAY %02d / 30}\par\vspace{10pt}" "\n" % d["n"]
        + r"{\color{pink}\rule{0.55\linewidth}{2pt}}\par\vspace{20pt}" "\n"
        + r"{\disp\color{pink}\fontsize{40}{44}\selectfont\adjustbox{max width=0.94\linewidth}{"
        + title + r"}}\par\vspace{26pt}" "\n"
        + eq + "\n"
        + r"{\color{muted}\small " + d["source"].replace("&", r"\&") + r"}\par\vspace{8pt}" "\n"
        + r"{\ttfamily\color{cyan} ONLY THE WEIRD SURVIVES}" "\n"
        + r"\vspace*{\fill}\end{center}\clearpage" "\n")

def main():
    tex = PRE + "".join(card(d) for d in SERIES) + r"\end{document}" "\n"
    (CARDS / "_cards.tex").write_text(tex)
    r = subprocess.run(["tectonic", str(CARDS / "_cards.tex"), "--outdir", str(CARDS)],
                       capture_output=True, text=True)
    pdf = CARDS / "_cards.pdf"
    if not pdf.exists():
        print(r.stderr[-2500:]); raise SystemExit("card build failed")
    # split to per-day PNGs
    subprocess.run(["pdftoppm", "-png", "-r", "120", str(pdf), str(CARDS / "day")],
                   check=True)
    # pdftoppm names day-01.png ... rename to day_NN.png
    for p in sorted(CARDS.glob("day-*.png")):
        num = int(p.stem.split("-")[1])
        p.rename(CARDS / f"day_{num:02d}.png")
    for f in ("_cards.tex", "_cards.pdf"):
        (CARDS / f).unlink(missing_ok=True)
    print(f"Rendered {len(list(CARDS.glob('day_*.png')))} cards -> {CARDS}")

if __name__ == "__main__":
    main()
