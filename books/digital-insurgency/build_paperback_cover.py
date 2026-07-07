#!/usr/bin/env python3
"""
build_paperback_cover.py -- Full-wrap paperback cover PDF (back + spine + front)
sized to KDP spec from the interior's actual page count.

Trim 6x9, bleed 0.125", white paper (spine factor 0.002252"/page).
Output: build/Digital_Insurgency_Paperback_Cover.pdf  +  build/paperback_specs.txt
Requires: pdfinfo (poppler), tectonic.
"""
import subprocess
from pathlib import Path

BASE = Path(__file__).parent
BUILD = BASE / "build"
FONTS = BASE / "fonts"
INTERIOR = BUILD / "Digital_Insurgency_Paperback_6x9.pdf"

TRIM_W, TRIM_H, BLEED = 6.0, 9.0, 0.125
SPINE_PER_PAGE = 0.002252  # white paper


def page_count(pdf):
    out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
    for line in out.splitlines():
        if line.startswith("Pages:"):
            return int(line.split()[1])
    raise SystemExit("could not read page count")


def main():
    pages = page_count(INTERIOR)
    spine = round(pages * SPINE_PER_PAGE, 3)
    W = round(2 * TRIM_W + spine + 2 * BLEED, 3)
    H = round(TRIM_H + 2 * BLEED, 3)
    back_cx = round(BLEED + TRIM_W / 2, 3)
    spine_cx = round(BLEED + TRIM_W + spine / 2, 3)
    front_cx = round(BLEED + TRIM_W + spine + TRIM_W / 2, 3)
    cy = round(H / 2, 3)

    specs = (f"Paperback specs (KDP, white paper)\n"
             f"  Interior page count : {pages}\n"
             f"  Trim                : 6 x 9 in\n"
             f"  Bleed               : 0.125 in all sides\n"
             f"  Spine width         : {spine} in  ({pages} x {SPINE_PER_PAGE})\n"
             f"  Full cover wrap     : {W} x {H} in\n"
             f"  (back {TRIM_W} | spine {spine} | front {TRIM_W}, + bleed)\n")
    (BUILD / "paperback_specs.txt").write_text(specs)
    print(specs)

    fp = str(FONTS) + "/"
    spine_txt = (r"\rotatebox{-90}{\dispS\color{pink} DIGITAL INSURGENCY"
                 r"\quad\color{cyan}\small SPACE PIRATE ZERO}") if spine >= 0.35 else \
                (r"\rotatebox{-90}{\dispS\color{pink} DIGITAL INSURGENCY}")

    tex = rf"""\documentclass{{article}}
\usepackage[paperwidth={W}in,paperheight={H}in,margin=0in]{{geometry}}
\usepackage{{fontspec}}\usepackage{{xcolor}}\usepackage{{tikz}}
\pagestyle{{empty}}
\definecolor{{void}}{{HTML}}{{030303}}
\definecolor{{pink}}{{HTML}}{{FF1493}}
\definecolor{{cyan}}{{HTML}}{{00F0FF}}
\definecolor{{paper}}{{HTML}}{{E8E8E8}}
\definecolor{{muted}}{{HTML}}{{8A90A0}}
\newfontfamily\disp{{Orbitron-900.ttf}}[Path={fp}]
\newfontfamily\dispS{{Orbitron-700.ttf}}[Path={fp}]
\setmainfont{{SpaceGrotesk-400.ttf}}[Path={fp},BoldFont=SpaceGrotesk-700.ttf,
  ItalicFont=SpaceGrotesk-400.ttf,ItalicFeatures={{FakeSlant=0.18}}]
\newfontfamily\mono{{JetBrainsMono-400.ttf}}[Path={fp}]
\begin{{document}}
\begin{{tikzpicture}}[remember picture,overlay]
\fill[void] (current page.south west) rectangle (current page.north east);
% spine rules (front edge / back edge of spine)
% FRONT cover
\node[anchor=center,text width=5in,align=center]
  at ([xshift={front_cx}in,yshift={cy}in]current page.south west) {{%
  {{\dispS\color{{cyan}}\large SPACE PIRATE ZERO}}\\[10pt]
  {{\color{{pink}}\rule{{4.6in}}{{2.5pt}}}}\\[20pt]
  {{\disp\color{{pink}}\fontsize{{40}}{{44}}\selectfont DIGITAL\\[6pt]INSURGENCY}}\\[18pt]
  {{\itshape\color{{paper}}\large A Field Manual for Smuggling\\Authenticity Past the Corporate\\Immune System}}\\[12pt]
  {{\color{{cyan}}\rule{{4.6in}}{{1pt}}}}\\[10pt]
  {{\mono\color{{cyan}}\small ONLY THE WEIRD SURVIVES}}%
  }};
% BACK cover
\node[anchor=center,text width=4.6in,align=left]
  at ([xshift={back_cx}in,yshift={cy}in]current page.south west) {{%
  {{\dispS\color{{pink}}\large EVERY LINE OF SOFTWARE ON\\EARTH IS ABOUT TO BE REWRITTEN.}}\\[14pt]
  {{\color{{paper}} A field manual for builders who refuse to ship corporate crap.
  Part business strategy, part cyberpunk graphic novel, part spec-ops briefing:
  the enterprise as a physics problem, modeled with 24 equations, and the art of
  ``good trouble'' --- John Lewis's doctrine ported to enterprise IT.}}\\[12pt]
  {{\itshape\color{{cyan}} Deface the currency. Only the weird survives.}}\\[16pt]
  {{\mono\color{{muted}}\footnotesize Spaceship Alpha 9, LLC \textbullet\ 2026}}%
  }};
% SPINE
\node at ([xshift={spine_cx}in,yshift={cy}in]current page.south west) {{{spine_txt}}};
\end{{tikzpicture}}
\end{{document}}
"""
    texf = BUILD / "_cover_wrap.tex"
    texf.write_text(tex)
    r = subprocess.run(["tectonic", str(texf), "--outdir", str(BUILD)],
                       capture_output=True, text=True)
    out = BUILD / "_cover_wrap.pdf"
    final = BUILD / "Digital_Insurgency_Paperback_Cover.pdf"
    if out.exists():
        out.rename(final)
        print(f"PDF: {final}  ({final.stat().st_size/1024:.0f} KB)")
    else:
        print(r.stderr[-2500:])
        raise SystemExit("cover wrap build failed")


if __name__ == "__main__":
    main()
