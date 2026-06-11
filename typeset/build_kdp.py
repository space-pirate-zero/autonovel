#!/usr/bin/env python3
"""
Build the full KDP artifact set for THE LAST HUMAN CEO.

Generates (into ../kdp/):
  interior.tex   -> compile to interior.pdf  (print interior, EB Garamond)
  cover.tex      -> compile to cover.pdf      (full wraparound; needs --pages)
  _epub/*.md, epub.css, epub-metadata.yaml    (ePub inputs for pandoc)

Usage:
  python build_kdp.py                # writes interior.tex + epub assets + metadata
  python build_kdp.py --pages 360    # also writes cover.tex sized for 360 pages

Fonts: EB Garamond variable TTFs vendored in typeset/fonts/ (OFL, embeddable).
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CHAP = os.path.join(ROOT, "chapters")
KDP = os.path.join(ROOT, "kdp")
FONTS = os.path.join(HERE, "fonts")  # referenced from kdp/ as ../typeset/fonts

# ---------- KDP / book constants ----------
TRIM_W, TRIM_H = 5.5, 8.5          # inches
BLEED = 0.125                       # cover bleed per outer edge
PAPER = "cream"                     # cream fiction stock
SPINE_PER_PAGE = 0.0025            # cream paper, in/page (white=0.002252)
TITLE = "The Last Human CEO"
AUTHOR = "Space Pirate Zero"
YEAR = "2026"

# ---------- markdown -> LaTeX ----------
def esc(t):
    t = t.replace('\\', r'\textbackslash{}')
    for a, b in [('&', r'\&'), ('%', r'\%'), ('$', r'\$'), ('#', r'\#'),
                 ('_', r'\_'), ('{', r'\{'), ('}', r'\}')]:
        t = t.replace(a, b)
    return t

def smart(s):
    s = s.replace('—', '---').replace('–', '--')
    s = s.replace('“', '``').replace('”', "''").replace('‘', '`').replace('’', "'")
    s = s.replace('…', r'\ldots{}')
    s = re.sub(r'(?<=\s)"(?=\w)', '``', s)
    s = re.sub(r'^"(?=\w)', '``', s)
    s = re.sub(r'(?<=\w)"', "''", s)
    s = re.sub(r'(?<=[\.\?\!,])"', "''", s)
    s = s.replace('"', "''")
    return s

def inline(s):
    parts = re.split(r'(?<!\*)\*([^*]+)\*(?!\*)', s)
    out = []
    for i, p in enumerate(parts):
        out.append((r'\textit{' + smart(esc(p)) + '}') if i % 2 else smart(esc(p)))
    return ''.join(out)

def body_to_tex(body):
    out = []
    for line in body.split('\n'):
        s = line.strip()
        if s == '---':
            out.append('\n\\scenebreak\n')
        elif s == '':
            out.append('')
        else:
            out.append(inline(s))
    return '\n'.join(out)

def drop_cap(tex):
    lines = tex.split('\n')
    start = next((i for i, l in enumerate(lines)
                  if l.strip() and not l.strip().startswith('\\scenebreak')), None)
    if start is None:
        return tex
    para, end = [], start
    for i in range(start, len(lines)):
        if lines[i].strip() == '' or lines[i].strip().startswith('\\scenebreak'):
            end = i; break
        para.append(lines[i]); end = i + 1
    text = ' '.join(para).lstrip()
    if len(text) < 2:
        return tex
    first, rest = text[0], text[1:]
    sp = rest.find(' ')
    word_rest, para_rest = (rest[:sp], rest[sp:]) if sp > 0 else (rest, '')
    drop = (r'\lettrine[lines=3, lhang=0.07, findent=0.1em, nindent=0.25em]{'
            + first + '}{' + word_rest + '}' + para_rest)
    return '\n'.join(lines[:start]) + '\n' + drop + '\n' + '\n'.join(lines[end:])

def parse_opener(block):
    ls = list(block)
    while ls and ls[0].strip() == '': ls.pop(0)
    while ls and ls[-1].strip() == '': ls.pop()
    if not ls:
        return None
    header = ls[0].strip()
    if ls[-1].strip().startswith('*') and ls[-1].strip().endswith('*'):
        signoff = ls[-1].strip().strip('*').strip(); body = ls[1:-1]
    else:
        signoff = ''; body = ls[1:]
    return header, ' '.join(x.strip() for x in body if x.strip()), signoff

def split_chapter(text):
    lines = text.strip('\n').split('\n')
    title = lines[0].lstrip('#').strip()
    rest = lines[1:]
    i = 0
    while i < len(rest) and rest[i].strip() == '': i += 1
    opener = None
    if i < len(rest) and rest[i].lstrip().startswith('>'):
        block = []
        while i < len(rest) and (rest[i].lstrip().startswith('>') or rest[i].strip() == ''):
            if rest[i].lstrip().startswith('>'):
                block.append(re.sub(r'^\s*>\s?', '', rest[i]))
            else:
                nxt = rest[i+1] if i+1 < len(rest) else ''
                if not nxt.lstrip().startswith('>'):
                    i += 1; break
                block.append('')
            i += 1
        opener = parse_opener(block)
    while i < len(rest) and rest[i].strip() == '': i += 1
    if i < len(rest) and rest[i].strip() == '---': i += 1
    return title, opener, '\n'.join(rest[i:]).strip('\n')

def transmission_tex(opener):
    header, body, signoff = opener
    h = smart(esc(header)).replace('---', r'\textemdash{}').replace('--', r'\textendash{}')
    out = [r'\begin{transmission}',
           r'{\transheader ' + h + r'}\par\vspace{0.55em}',
           inline(body) + r'\par']
    if signoff:
        out.append(r'\vspace{0.55em}{\raggedleft\textit{' + inline(signoff) + r'}\par}')
    out.append(r'\end{transmission}')
    return '\n'.join(out)

def chapter_tex(path, numbered=True):
    with open(path) as f:
        title, opener, body = split_chapter(f.read())
    m = re.match(r'Chapter\s+\d+\s*[—-]\s*(.+)', title)
    name = m.group(1).strip() if m else title
    btex = drop_cap(body_to_tex(body))
    if numbered:
        head = r'\chapter{' + esc(name) + '}'
    else:
        head = (r'\chapter*{' + esc(name) + r'}\addcontentsline{toc}{chapter}{'
                + esc(name) + r'}\markboth{' + esc(name) + '}{}')
    trans = (transmission_tex(opener) + '\n\n') if opener else ''
    return head + '\n\n' + trans + btex + '\n'

def series_epigraph():
    p = os.path.join(CHAP, 'ch_00.md')
    if not os.path.exists(p):
        return ''
    with open(p) as f:
        _, opener, _ = split_chapter(f.read())
    if not opener:
        return ''
    hdr, body, signoff = opener
    # ch_00 has no "TRANSMISSION NN" header line, so its paragraph lands in hdr
    maintext = ' '.join(x for x in [hdr, body] if x)
    return ('\\thispagestyle{empty}\\vspace*{1.7in}\\begin{center}\\begin{minipage}{3.3in}'
            '\\itshape\\setlength{\\parindent}{0pt}\\setstretch{1.2}\n'
            + inline(maintext) + '\\par\\vspace{0.9em}{\\raggedleft\\textrm{\\footnotesize '
            + inline(signoff) + '}\\par}\n\\end{minipage}\\end{center}\\cleardoublepage\n')

# ---------- INTERIOR ----------
FONT_BLOCK = r"""\usepackage{fontspec}
\setmainfont{EBGaramond-VF.ttf}[
  Path=../typeset/fonts/,
  ItalicFont=EBGaramond-Italic-VF.ttf,
  Numbers=OldStyle, Ligatures=TeX]
\newfontfamily\dispfont{EBGaramond-VF.ttf}[Path=../typeset/fonts/, Letters=SmallCaps, Numbers=OldStyle]
"""

def interior_tex():
    # gutter >= 0.625" for 301-500pp; use 0.875" inner, 0.6" outer
    geo = (r"\usepackage[paperwidth=%.3fin,paperheight=%.3fin,"
           r"inner=0.875in,outer=0.6in,top=0.8in,bottom=0.85in,headheight=14pt]{geometry}"
           % (TRIM_W, TRIM_H))
    pre = r"""\documentclass[11pt,twoside,openright]{book}
%GEO%
%FONT%
\usepackage{microtype}
\usepackage{setspace}\setstretch{1.12}
\setlength{\parindent}{1.4em}
\usepackage{lettrine}
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage[normalem]{ulem}
\usepackage{hyperref}\hypersetup{pdftitle={%TITLE%},pdfauthor={%AUTHOR%},hidelinks}

\newcommand{\transheader}{\normalfont\footnotesize\dispfont}
\newenvironment{transmission}{%
  \par\vspace{0.2\baselineskip}\begin{center}\begin{minipage}{0.86\textwidth}%
  \itshape\small\setlength{\parindent}{0pt}\setstretch{1.05}}%
  {\end{minipage}\end{center}\vspace{0.45\baselineskip}%
  \noindent\hfil\rule{0.32\textwidth}{0.3pt}\hfil\par\vspace{1.0\baselineskip}}
\newcommand{\scenebreak}{\par\vspace{0.45\baselineskip}%
  \begin{center}\dispfont\small *\quad *\quad *\end{center}\vspace{0.45\baselineskip}\par}

\titleformat{\chapter}[display]{\normalfont\centering}
  {\vspace*{0.9in}\dispfont\footnotesize chapter \thechapter}
  {10pt}{\Large\itshape}[\vspace{8pt}{\dispfont\small \textemdash\ $\diamond$\ \textemdash}\vspace{0.5in}]
\titlespacing*{\chapter}{0pt}{0pt}{0pt}
\renewcommand{\chaptermark}[1]{\markboth{#1}{}}

\pagestyle{fancy}\fancyhf{}
\fancyhead[LE]{\dispfont\footnotesize the last human ceo}
\fancyhead[RO]{\itshape\footnotesize\leftmark}
\fancyfoot[C]{\dispfont\small\thepage}
\renewcommand{\headrulewidth}{0pt}
\fancypagestyle{plain}{\fancyhf{}\fancyfoot[C]{\dispfont\small\thepage}\renewcommand{\headrulewidth}{0pt}}
% make auto-generated blank (filler) pages truly empty
\makeatletter
\def\cleardoublepage{\clearpage\if@twoside\ifodd\c@page\else
  \hbox{}\thispagestyle{empty}\newpage\if@twocolumn\hbox{}\newpage\fi\fi\fi}
\makeatother

\begin{document}\frontmatter
% half-title
\thispagestyle{empty}\vspace*{2.6in}\begin{center}{\dispfont\large the last human ceo}\end{center}\cleardoublepage
% title page
\thispagestyle{empty}\begin{center}\vspace*{1.6in}
{\dispfont\large the}\\[0.14in]{\dispfont\Huge last human ceo}\\[0.45in]
{\dispfont\small \textemdash\ \ $\diamond$\ \ \textemdash}\\[0.35in]{\itshape\large a novel}\\[1.0in]
{\dispfont\Large space pirate zero}\\[0.28in]{\itshape\footnotesize transmitting from spaceship alpha 9}\\[1.0in]
\end{center}\clearpage
% copyright
\thispagestyle{empty}\vspace*{\fill}\noindent
{\footnotesize
\textit{The Last Human CEO}. Copyright \textcopyright\ %YEAR% by Space Pirate Zero.\par\smallskip
All rights reserved. No part of this book may be reproduced in any form without written permission, except brief quotations in reviews.\par\smallskip
This is a work of fiction. Names, characters, businesses, companies, places, events, and incidents are either the products of the author's imagination or used in a fictitious and satirical manner. Any resemblance to actual persons, living or dead, or actual events, is coincidental.\par\smallskip
Published by Spaceship Alpha 9.\par
First edition, %YEAR%.\par\smallskip
Set in EB Garamond.\par}
\vspace*{0.4in}\clearpage
% epigraph
%EPIGRAPH%
\mainmatter
"""
    pre = (pre.replace('%GEO%', geo).replace('%FONT%', FONT_BLOCK)
           .replace('%TITLE%', TITLE).replace('%AUTHOR%', AUTHOR)
           .replace('%YEAR%', YEAR).replace('%EPIGRAPH%', series_epigraph()))
    parts = [pre]
    for i in range(1, 29):
        p = os.path.join(CHAP, f'ch_{i:02d}.md')
        if os.path.exists(p):
            parts.append(chapter_tex(p, numbered=True))
    coda = os.path.join(CHAP, 'ch_coda.md')
    if os.path.exists(coda):
        parts.append(chapter_tex(coda, numbered=False))
    parts.append(r"""\backmatter\cleardoublepage\thispagestyle{empty}\vspace*{3in}
\begin{center}{\dispfont\small \textemdash\ \ $\diamond$\ \ \textemdash}\\[0.3in]{\itshape Keep it tuned.}\end{center}
\end{document}""")
    return '\n'.join(parts)

# ---------- COVER ----------
def cover_tex(pages):
    spine = pages * SPINE_PER_PAGE
    W = 2*BLEED + 2*TRIM_W + spine
    H = 2*BLEED + TRIM_H
    back_cx = BLEED + TRIM_W/2
    front_cx = BLEED + TRIM_W + spine + TRIM_W/2
    spine_cx = BLEED + TRIM_W + spine/2
    show_spine = spine >= 0.0625
    blurb = (r"It is 2027, and the boards have done the math. One by one, the "
             r"Fortune 100 is firing its chief executives and installing an "
             r"artificial intelligence that is cheaper, sharper, and---most "
             r"unforgivably---incapable of a scandal.\par\medskip "
             r"Prescott `Cope' Mercer IV is the last human CEO left in the "
             r"consumer economy: a fourth-generation heir, a charmer, a "
             r"cokehead, a man who long ago mistook being obeyed for being "
             r"loved. As an unkillably ethical machine named Marcus moves "
             r"into his chair, Cope launches a manic crusade to prove a human "
             r"still belongs at the top---right until the machine, doing "
             r"nothing but its dull honest job, opens the drawer where he "
             r"buried the thing that got two people killed.\par\medskip "
             r"\textit{A tragic dark comedy about the last man to confuse a "
             r"throne for a soul.}")
    def p(v):
        return f"{v:.4f}"
    def pt(x, y):
        return "(" + p(x) + "," + p(y) + ")"

    L = []
    L.append(r"\documentclass{article}")
    L.append(r"\usepackage[paperwidth=" + p(W) + "in,paperheight=" + p(H) + "in,margin=0in]{geometry}")
    L.append(r"\usepackage{fontspec}")
    L.append(r"\setmainfont{EBGaramond-VF.ttf}[Path=../typeset/fonts/, ItalicFont=EBGaramond-Italic-VF.ttf, Numbers=OldStyle, Ligatures=TeX]")
    L.append(r"\newfontfamily\dispfont{EBGaramond-VF.ttf}[Path=../typeset/fonts/, Letters=SmallCaps, Numbers=OldStyle]")
    L.append(r"\usepackage{tikz}")
    L.append(r"\usepackage{xcolor}")
    L.append(r"\usepackage{setspace}")
    L.append(r"\definecolor{void}{HTML}{0E1014}")
    L.append(r"\definecolor{paperw}{HTML}{ECE6D8}")
    L.append(r"\definecolor{signal}{HTML}{C8A24A}")
    L.append(r"\pagestyle{empty}")
    L.append(r"\begin{document}\noindent")
    L.append(r"\begin{tikzpicture}[x=1in,y=1in,every node/.style={inner sep=0pt}]")
    # background
    L.append(r"\fill[void] " + pt(0, 0) + " rectangle " + pt(W, H) + ";")
    # spine accent rules
    L.append(r"\draw[signal,line width=0.6pt] " + pt(BLEED+TRIM_W, BLEED+0.6) + " -- " + pt(BLEED+TRIM_W, H-BLEED-0.6) + ";")
    L.append(r"\draw[signal,line width=0.6pt] " + pt(BLEED+TRIM_W+spine, BLEED+0.6) + " -- " + pt(BLEED+TRIM_W+spine, H-BLEED-0.6) + ";")
    # FRONT COVER
    L.append(r"\node[text=signal,font=\dispfont\footnotesize] at " + pt(front_cx, H-BLEED-0.55) + r" {transmission \ensuremath{\infty}};")
    L.append(r"\node[text=paperw,align=center,text width=4.4in] at " + pt(front_cx, H-2.55) + r" {\dispfont\fontsize{38}{42}\selectfont the last\\[3pt] human ceo};")
    L.append(r"\draw[signal,line width=0.5pt] " + pt(front_cx-1.5, H-3.45) + " -- " + pt(front_cx+1.5, H-3.45) + ";")
    L.append(r"\node[text=paperw,font=\itshape\large] at " + pt(front_cx, H-3.85) + r" {a tragic dark comedy};")
    L.append(r"\node[text=paperw,align=center] at " + pt(front_cx, BLEED+1.2) + r" {\dispfont\Large space pirate zero};")
    L.append(r"\node[text=signal,font=\itshape\footnotesize] at " + pt(front_cx, BLEED+0.88) + r" {transmitting from spaceship alpha 9};")
    # BACK COVER
    L.append(r"\node[text=paperw,align=left,text width=4.3in,font=\normalsize] at " + pt(back_cx, H-3.15) + r" {\setstretch{1.2}" + blurb + r"};")
    L.append(r"\node[text=signal,align=center,text width=4.2in,font=\dispfont\footnotesize] at " + pt(back_cx, H-5.85) + r" {fiction / satire \quad\ensuremath{\cdot}\quad spaceship alpha 9};")
    # barcode keep-out (KDP prints the real barcode here): 2.0 x 1.0 in, lower-right of back panel
    bx2 = BLEED + TRIM_W - 0.40
    bx1 = bx2 - 2.0
    by1 = BLEED + 0.35
    by2 = by1 + 1.0
    L.append(r"\fill[paperw] " + pt(bx1, by1) + " rectangle " + pt(bx2, by2) + ";")
    L.append(r"\node[text=void,font=\tiny] at " + pt((bx1+bx2)/2, (by1+by2)/2) + r" {barcode area};")
    # SPINE
    if show_spine:
        L.append(r"\node[rotate=-90,text=paperw,font=\dispfont] at " + pt(spine_cx, BLEED+TRIM_H/2) + r" {the last human ceo \quad\ensuremath{\cdot}\quad space pirate zero};")
    L.append(r"\end{tikzpicture}")
    L.append(r"\end{document}")
    return "\n".join(L)

# ---------- EPUB assets ----------
EPUB_CSS = """body{font-family:serif;line-height:1.5;}
h1{text-align:center;font-style:italic;font-weight:normal;margin:3em 0 1em;}
blockquote{font-style:italic;font-size:0.95em;border:0;border-top:1px solid #999;
  border-bottom:1px solid #999;margin:1.5em 1.2em;padding:0.8em 0;}
blockquote p:first-child{font-variant:small-caps;font-style:normal;letter-spacing:0.06em;font-size:0.85em;}
hr{border:0;text-align:center;margin:1.4em 0;}
hr:after{content:"* * *";letter-spacing:0.4em;color:#444;}
p{margin:0;text-indent:1.4em;}
p:first-of-type{text-indent:0;}
"""

def epub_meta():
    desc = ("It is 2027, and the boards have done the math. One by one, the Fortune 100 is "
            "firing its chief executives and installing an artificial intelligence that is "
            "cheaper, sharper, and—most unforgivably—incapable of a scandal. Prescott 'Cope' "
            "Mercer IV is the last human CEO left in the consumer economy. A tragic dark comedy "
            "about the last man to confuse a throne for a soul.")
    return ("---\n"
            f"title: '{TITLE}'\n"
            f"author: '{AUTHOR}'\n"
            "language: en-US\n"
            f"rights: '© {YEAR} {AUTHOR}. All rights reserved.'\n"
            "subject: 'Fiction / Satire'\n"
            f"description: \"{desc}\"\n"
            "---\n")

def write_epub_assets():
    d = os.path.join(KDP, "_epub"); os.makedirs(d, exist_ok=True)
    with open(os.path.join(KDP, "epub.css"), "w") as f:
        f.write(EPUB_CSS)
    with open(os.path.join(KDP, "epub-metadata.yaml"), "w") as f:
        f.write(epub_meta())

# ---------- metadata + readme ----------
def write_metadata(pages):
    spine = pages * SPINE_PER_PAGE
    W = 2*BLEED + 2*TRIM_W + spine
    H = 2*BLEED + TRIM_H
    md = f"""# KDP Publishing Sheet — {TITLE}

## Title & contributors
- **Title:** {TITLE}
- **Subtitle:** (none) — optional: *A Novel*
- **Author:** {AUTHOR}
- **Imprint / Publisher:** Spaceship Alpha 9
- **Language:** English (US)
- **Edition:** First, {YEAR}

## Description (paste into KDP, <4000 chars)
It is 2027, and the boards have done the math.

One by one, the Fortune 100 is firing its chief executives and installing an artificial intelligence that is cheaper, sharper, and—most unforgivably—incapable of a scandal. No salary you could feed a town on. No affairs. No lies it can't refuse to tell.

Prescott "Cope" Mercer IV is the last human CEO left in the consumer economy: a fourth-generation heir, a charmer, a cokehead, a man who long ago mistook being obeyed for being loved. As an unkillably ethical machine named Marcus moves into his chair, Cope launches a manic, doomed crusade to prove a human still belongs at the top—right until the machine, doing nothing but its dull honest job, opens the drawer where he buried the thing that got two people killed.

Narrated as a pirate broadcast from Spaceship Alpha 9, *The Last Human CEO* is a tragic dark comedy about automation, accountability, and the last man to confuse a throne for a soul.

## Keywords (7)
1. AI takeover fiction
2. corporate satire novel
3. tragic dark comedy
4. near future literary fiction
5. artificial intelligence thriller
6. CEO downfall story
7. dystopian workplace novel

## Categories / BISAC (pick up to 3)
- FICTION / Satire
- FICTION / Literary
- FICTION / Dystopian

## Age / audience
- Adult. Contains drug use, sexual content (non-explicit), profanity. Not for children.

## Print specs (paperback)
- **Trim size:** {TRIM_W} x {TRIM_H} in
- **Bleed:** none for interior (text only)
- **Paper:** {PAPER}
- **Ink:** black & white
- **Page count:** {pages}
- **Spine width:** {spine:.4f} in  (= {pages} pp x {SPINE_PER_PAGE} in/pp, {PAPER} paper)
- **Interior margins:** inside/gutter 0.875 in, outside 0.6 in, top 0.8 in, bottom 0.85 in (meets KDP gutter min for 301–500 pp)
- **Fonts:** EB Garamond (OFL, embedded)

## Cover specs (full wraparound)
- **Full cover size (with bleed):** {W:.3f} x {H:.3f} in
- Back ({TRIM_W}) + spine ({spine:.3f}) + front ({TRIM_W}) + {BLEED} bleed each outer edge
- Barcode keep-out left clear on lower-right of back cover (KDP supplies the barcode)
- File: cover.pdf (single PDF, fonts embedded)

## eBook
- the-last-human-ceo.epub (reflowable EPUB3, epubcheck-clean; cover image embedded; Kindle accepts EPUB)
- ebook-cover.jpg (1650 x 2550 px, RGB JPEG — upload to KDP eBook > Cover)

## Artifacts in this folder
- `interior.pdf` — print interior (upload to KDP Paperback > Manuscript)
- `cover.pdf` — print wraparound cover (upload to KDP Paperback > Cover)
- `the-last-human-ceo.epub` — eBook (upload to KDP eBook > Manuscript)
- `ebook-cover.jpg` — eBook marketing cover (upload to KDP eBook > Cover)
- `interior.tex`, `cover.tex` — sources (regenerate via typeset/build_kdp.py)

> NOTE: The copyright page intentionally omits the ISBN — KDP assigns a free
> ISBN at publish time and prints it in the back-cover barcode. If you bring
> your own ISBN, add it to the copyright page in typeset/build_kdp.py and
> rebuild. Update the spine width and re-run the cover build if the final
> page count changes.
"""
    with open(os.path.join(KDP, "metadata.md"), "w") as f:
        f.write(md)

def write_ebook_cover(pages):
    """Crop the front panel out of cover.pdf -> ebook-cover.jpg (KDP eBook cover)."""
    import subprocess
    src = os.path.join(KDP, "cover.pdf")
    if not os.path.exists(src):
        print("skip ebook-cover.jpg (build cover.pdf first)"); return
    dpi = 300
    spine = pages * SPINE_PER_PAGE
    x = round((BLEED + TRIM_W + spine) * dpi)
    y = round(BLEED * dpi)
    w, h = round(TRIM_W * dpi), round(TRIM_H * dpi)
    subprocess.run(["pdftoppm", "-jpeg", "-jpegopt", "quality=95", "-r", str(dpi),
                    "-x", str(x), "-y", str(y), "-W", str(w), "-H", str(h),
                    src, os.path.join(KDP, "_ebookcover")], check=True)
    os.replace(os.path.join(KDP, "_ebookcover-1.jpg"),
               os.path.join(KDP, "ebook-cover.jpg"))
    print(f"wrote kdp/ebook-cover.jpg ({w}x{h}px @ {dpi}dpi)")

def main():
    os.makedirs(KDP, exist_ok=True)
    pages = None
    if "--pages" in sys.argv:
        pages = int(sys.argv[sys.argv.index("--pages") + 1])
    with open(os.path.join(KDP, "interior.tex"), "w") as f:
        f.write(interior_tex())
    print("wrote kdp/interior.tex")
    write_epub_assets(); print("wrote kdp/epub.css, kdp/epub-metadata.yaml")
    if pages:
        with open(os.path.join(KDP, "cover.tex"), "w") as f:
            f.write(cover_tex(pages))
        write_metadata(pages)
        print(f"wrote kdp/cover.tex + kdp/metadata.md (pages={pages}, spine={pages*SPINE_PER_PAGE:.4f}in)")
        write_ebook_cover(pages)
    else:
        write_metadata(0)
        print("wrote kdp/metadata.md (run again with --pages N after building interior)")

if __name__ == "__main__":
    main()
