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

def dquotes(s):
    # Disambiguate straight double quotes with full-line context. Must run
    # BEFORE the italic split: an opening quote may directly precede an
    # italic span ("*Human,*"), which the old word-char lookahead missed,
    # producing reversed quotes in print.
    s = re.sub(r'(^|(?<=[\s(—–-]))"', '“', s)
    return s.replace('"', '”')

def smart(s):
    s = re.sub(r'(?<=\S)\s*—\s*(?=\S)', '—', s)  # house style: closed-up em dash
    s = s.replace('—', '---').replace('–', '--')
    s = s.replace('“', '``').replace('”', "''").replace('‘', '`').replace('’', "'")
    s = s.replace('…', r'\ldots{}')
    return s

def inline(s):
    s = dquotes(s)
    parts = re.split(r'(?<!\*)\*([^*]+)\*(?!\*)', s)
    out = []
    for i, p in enumerate(parts):
        out.append((r'\textit{' + smart(esc(p)) + '}') if i % 2 else smart(esc(p)))
    return ''.join(out)

def body_to_tex(body):
    # mid-body markdown blockquotes (the machine's on-screen answers, its
    # letter) -> machineblock environment; the opener transmission was
    # already consumed by split_chapter
    out = []
    lines = body.split('\n')
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if s.startswith('>'):
            block = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                block.append(re.sub(r'^\s*>\s?', '', lines[i].rstrip()))
                i += 1
            paras, cur = [], []
            for b in block:
                if b.strip() == '':
                    if cur:
                        paras.append(' '.join(cur)); cur = []
                else:
                    cur.append(b.strip())
            if cur:
                paras.append(' '.join(cur))
            out.append('\\begin{machineblock}')
            out.append('\n\n'.join(inline(p) for p in paras))
            out.append('\\end{machineblock}')
            continue
        if s == '---':
            out.append('\n\\scenebreak\n')
        elif s == '':
            out.append('')
        else:
            out.append(inline(s))
        i += 1
    return '\n'.join(out)

def drop_cap(tex):
    lines = tex.split('\n')
    n = len(lines)
    start = next((i for i, l in enumerate(lines)
                  if l.strip() and not l.strip().startswith('\\scenebreak')), None)
    if start is None:
        return tex

    def grab_para(idx):
        para = []
        while idx < n and lines[idx].strip() and not lines[idx].strip().startswith('\\scenebreak'):
            para.append(lines[idx]); idx += 1
        return ' '.join(para).strip(), idx

    text, end = grab_para(start)
    if len(text) < 2:
        return tex
    # lettrine only shapes ONE paragraph: if the opener is shorter than the
    # 3-line drop cap, the next paragraph overprints the glyph. Join short
    # openers to the following paragraph(s) inside one TeX paragraph, keeping
    # the visual paragraph break via \hfill\break + indent, so every line
    # beside the drop cap is shaped around it.
    SHORT = 210
    while len(re.sub(r'\\[a-zA-Z]+\*?(\{[^}]*\})?', '', text)) < SHORT:
        j = end
        while j < n and not lines[j].strip():
            j += 1
        if j >= n or lines[j].strip().startswith(('\\scenebreak', '\\begin')):
            break
        nxt, end = grab_para(j)
        text += r'\hfill\break\hspace*{1.4em}' + nxt
    first, rest = text[0], text[1:]
    if rest[:1] == ' ':
        # single-letter first word ("A", "I"): nothing left of the word
        word_rest, para_rest = '', rest
    else:
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
    h = smart(esc(dquotes(header))).replace('---', r' \textemdash{} ').replace('--', r'\textendash{}')
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
\newfontfamily\dispfont{EBGaramond-VF.ttf}[Path=../typeset/fonts/, Letters=SmallCaps, Numbers=OldStyle, Ligatures=TeX]
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
\frenchspacing
\ifdefined\XeTeXdashbreakstate \XeTeXdashbreakstate=1 \fi
\emergencystretch=2.5em
\widowpenalty=10000 \clubpenalty=10000
\raggedbottom
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
\newcommand{\scenebreak}{\par\penalty-50\vspace{0.45\baselineskip}\nopagebreak
  {\centering\dispfont\small *\quad *\quad *\par}\nopagebreak\vspace{0.45\baselineskip}\nopagebreak}
\newenvironment{machineblock}{\par\vspace{0.5\baselineskip}%
  \begin{list}{}{\setlength{\leftmargin}{1.6em}\setlength{\rightmargin}{1.6em}%
  \setlength{\topsep}{0pt}\setlength{\partopsep}{0pt}}\item[]%
  \small\setlength{\parindent}{0pt}\setlength{\parskip}{0.45\baselineskip}\setstretch{1.05}}%
  {\end{list}\vspace{0.5\baselineskip}\par}

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
\begin{center}{\dispfont\small \textemdash\ \ $\diamond$\ \ \textemdash}\\[0.3in]{\itshape End of transmission.}\end{center}
\end{document}""")
    return '\n'.join(parts)

# ---------- COVER (mania-collage scandal-tabloid design) ----------
def cover_tex(pages):
    spine = pages * SPINE_PER_PAGE
    W = 2*BLEED + 2*TRIM_W + spine
    H = 2*BLEED + TRIM_H
    bx0 = BLEED
    bx1 = BLEED + TRIM_W
    fx0 = bx1 + spine
    fx1 = fx0 + TRIM_W
    front_cx = (fx0 + fx1) / 2
    back_cx = (bx0 + bx1) / 2
    spine_cx = bx1 + spine/2

    def p(v): return f"{v:.4f}"
    def pt(x, y): return "(" + p(x) + "," + p(y) + ")"

    L = []
    L.append(r"\documentclass{article}")
    L.append(r"\usepackage[paperwidth=" + p(W) + "in,paperheight=" + p(H) + "in,margin=0in]{geometry}")
    L.append(r"\usepackage{fontspec}")
    L.append(r"\setmainfont{EBGaramond-VF.ttf}[Path=../typeset/fonts/, ItalicFont=EBGaramond-Italic-VF.ttf, Numbers=OldStyle, Ligatures=TeX]")
    L.append(r"\newfontfamily\impact{Impact}[Ligatures=TeX]")
    L.append(r"\newfontfamily\ablack{Arial Black}[Ligatures=TeX]")
    L.append(r"\newfontfamily\arial{Arial}[Ligatures=TeX]")
    L.append(r"\newfontfamily\atype{American Typewriter}[Ligatures=TeX]")
    L.append(r"\usepackage{tikz}")
    L.append(r"\usetikzlibrary{shapes.geometric,arrows.meta}")
    L.append(r"\usepackage{xcolor}")
    L.append(r"\usepackage{setspace}")
    L.append(r"\usepackage{graphicx}")
    L.append(r"\definecolor{inkred}{HTML}{C0201E}")
    L.append(r"\definecolor{inkyellow}{HTML}{F0C518}")
    L.append(r"\definecolor{inkblue}{HTML}{1E5AA8}")
    L.append(r"\definecolor{inkblack}{HTML}{1A1714}")
    L.append(r"\definecolor{paperw}{HTML}{F0E8D2}")
    L.append(r"\pagestyle{empty}")
    L.append(r"\begin{document}\noindent")
    L.append(r"\begin{tikzpicture}[x=1in,y=1in,every node/.style={inner sep=0pt,outer sep=0pt}]")

    # ---- background ----
    L.append(r"\fill[paperw] " + pt(0, 0) + " rectangle " + pt(W, H) + ";")
    if os.path.exists(os.path.join(ROOT, "art", "cover", "paper_bg.png")):
        L.append(r"\node[anchor=south west] at " + pt(0, 0)
                 + r" {\includegraphics[width=" + p(W) + "in,height=" + p(H)
                 + r"in]{../art/cover/paper_bg.png}};")
    # WATCH ME wallpaper scrawl, under everything
    for row in range(5):
        for col in range(4):
            wx = 0.4 + col * 3.2 + (row % 2) * 1.4
            wy = 0.7 + row * 1.85
            L.append(r"\node[rotate=-9,text=inkred,opacity=0.07] at " + pt(wx, wy)
                     + r" {\impact\fontsize{40}{40}\selectfont WATCH ME};")

    PH = "../art/cover/"

    def chip(x, y, rot, fill, color, size, lead, width, text,
             font=r"\impact", border=None, sep="4pt", op=None):
        opts = [f"rotate={rot}", f"text={color}", "align=center",
                f"text width={width}in", f"inner sep={sep}"]
        if fill: opts.append(f"fill={fill}")
        if border: opts.append(f"draw={border},line width=0.9pt")
        if op: opts.append(f"fill opacity=0.92,text opacity=1")
        L.append(r"\node[" + ",".join(opts) + "] at " + pt(x, y)
                 + r" {" + font + r"\fontsize{" + str(size) + "}{" + str(lead)
                 + r"}\selectfont " + text + r"};")

    def burst(x, y, rot, r1, fill, color, size, text):
        L.append(r"\node[star,star points=12,star point ratio=1.55,rotate=" + str(rot)
                 + r",minimum size=" + p(r1) + r"in,fill=" + fill
                 + r",draw=inkblack,line width=0.8pt,text=" + color
                 + r",align=center] at " + pt(x, y)
                 + r" {\ablack\fontsize{" + str(size) + "}{" + str(size)
                 + r"}\selectfont " + text + r"};")

    # ================= BACK PANEL (full derangement) =================
    # the eyes, enormous, across the whole back
    L.append(r"\node[rotate=1.5] at " + pt(back_cx, H-2.30)
             + r" {\includegraphics[width=5.9in]{" + PH + "cope_eyes.png}};")
    # top band, tilted
    chip(back_cx, H-0.48, -1.5, "inkblack", "paperw", 22, 23, 5.2,
         "HOW LONG CAN COPE KEEP IT UP?")
    # photos mid-back
    L.append(r"\node[rotate=6] at " + pt(1.55, H-5.15)
             + r" {\includegraphics[width=2.5in]{" + PH + "machine_board.png}};")
    L.append(r"\node[rotate=-7] at " + pt(4.25, H-5.35)
             + r" {\includegraphics[width=1.72in]{" + PH + "cope_shield.png}};")
    L.append(r"\node[rotate=-12,text=paperw,fill=inkred,inner sep=3pt] at " + pt(4.25, H-5.35)
             + r" {\impact\fontsize{13}{13}\selectfont NO COMMENT!};")
    # headline chips raining over everything
    chip(1.55, H-3.42, -3, "inkred", "paperw", 16, 17.5, 2.1, "TWO DEAD IN DEFIANCE!")
    chip(4.15, H-3.60, 2.5, "paperw", "inkred", 12.5, 14, 2.5,
         "WHAT DID THE MAYONNAISE KING KNOW --- AND WHEN?", border="inkblack")
    chip(1.15, H-4.18, -6, "inkblue", "paperw", 11, 12.5, 2.0,
         "LEADERSHIP AS A SERVICE --- NO OFF-SITES!")
    chip(4.45, H-4.35, 4, "inkblack", "inkyellow", 11.5, 13, 2.2,
         "IT CANNOT DECLINE TO LOG A THING IT FINDS!")
    chip(2.05, H-6.42, -7, "inkyellow", "inkblack", 13, 14.5, 2.3,
         "PIP BUILT THE THING REPLACING DADDY!")
    chip(4.55, H-6.30, 6, "inkred", "paperw", 12, 13.5, 1.8,
         "EXCLUSIVE: THE WARMTH MODULE!")
    chip(1.25, H-7.05, -2, "paperw", "inkblack", 11.5, 13, 2.0,
         "A STEWARD, NOT A SOVEREIGN?", border="inkblack")
    chip(3.65, H-7.12, 2, None, "inkblack", 12.5, 14, 2.6,
         "31 MILLION WATCH HIM WEEP AT CAMDEN!")
    chip(1.85, H-7.62, -5, None, "inkred", 11.5, 12.5, 2.4,
         "GIRL ON A PLANE --- WHO IS MARA V.?")
    chip(4.62, H-7.62, 0, None, "inkblack", 8.5, 9.5, 1.7,
         "`Try to be good anyway.'", font=r"\atype")
    burst(0.78, H-3.30, 8, 1.25, "inkyellow", "inkblack", 11, "11\\\\MINUTES!")
    burst(5.05, H-2.62, -10, 1.05, "inkred", "paperw", 9, "STOCK\\\\UP 9\\%!")
    # the machine's block: the ONE level, calm thing on the cover (also the blurb)
    L.append(r"\fill[white] " + pt(bx0+0.30, 1.98) + " rectangle " + pt(bx1-0.30, 3.92) + ";")
    L.append(r"\draw[inkblack,line width=1pt] " + pt(bx0+0.30, 1.98) + " rectangle " + pt(bx1-0.30, 3.92) + ";")
    L.append(r"\node[text=inkblack,anchor=north,align=left,text width=4.55in] at " + pt(back_cx, 3.80)
             + r" {\atype\fontsize{7.2}{9.1}\selectfont RATIONALE: No comment is required. The following is accurate to the record. "
             + r"It is 2027, and the boards have done the math. Prescott `Cope' Mercer IV --- fourth-generation heir, charmer, cokehead --- "
             + r"is the last human CEO in the consumer economy. An unkillably ethical machine named Marcus is moving into his chair. "
             + r"Cope launches a manic crusade to prove a human still belongs at the top --- right until the machine, doing nothing but its "
             + r"dull honest job, opens the drawer where he buried the thing that got two people killed. A tragic dark comedy about the "
             + r"last man to confuse a throne for a soul. This communication seeks no response.};")
    chip(1.65, 1.62, -2, "inkblack", "inkyellow", 12, 13, 2.3,
         "THIRTY MONTHS! IS THAT ALL THEY COST?")
    L.append(r"\node[text=inkblack,anchor=south west] at " + pt(bx0+0.30, 0.30)
             + r" {\atype\fontsize{7.5}{8.5}\selectfont FICTION / SATIRE \textbullet{} SPACESHIP ALPHA 9};")

    # ================= SPINE =================
    L.append(r"\fill[inkred] " + pt(bx1, 0) + " rectangle " + pt(fx0, H) + ";")
    if spine >= 0.0625:
        L.append(r"\node[rotate=-90,text=paperw] at " + pt(spine_cx, BLEED+0.45+TRIM_H/2)
                 + r" {\impact\fontsize{13}{13}\selectfont THE LAST HUMAN CEO \quad$\star$\quad SPACE PIRATE ZERO};")
        L.append(r"\node[rotate=-90,text=inkyellow] at " + pt(spine_cx, 0.78)
                 + r" {\arial\bfseries\itshape\fontsize{8}{8}\selectfont watch me};")

    # ================= FRONT PANEL =================
    # photos first (chips rain over them)
    L.append(r"\node[rotate=-7] at " + pt(fx1-1.42, H-4.42)
             + r" {\includegraphics[width=2.5in]{" + PH + "cope_toast.png}};")
    L.append(r"\node[rotate=4] at " + pt(fx0+1.42, H-6.95)
             + r" {\includegraphics[width=2.65in]{" + PH + "cope_rally.png}};")
    L.append(r"\node[rotate=-10] at " + pt(fx1-0.78, H-7.05)
             + r" {\includegraphics[width=1.05in]{" + PH + "pinwheel_spot.png}};")
    # CENSORED bar across the toast photo
    chip(fx1-1.42, H-5.42, -7, "inkblack", "paperw", 13, 13, 2.4,
         "CENSORED: PAGE EIGHT", sep="3.5pt")
    # kicker banner
    L.append(r"\fill[inkred] " + pt(fx0, H-0.60) + " rectangle " + pt(W, H) + ";")
    L.append(r"\node[text=paperw,rotate=-1] at " + pt(front_cx, H-0.335)
             + r" {\impact\fontsize{15}{16}\selectfont SEE WHAT MERCER PAID \$14.2 MILLION TO HIDE!};")
    # masthead (level, sacred)
    L.append(r"\draw[inkblack,line width=1.6pt] " + pt(fx0+0.22, H-0.80) + " -- " + pt(fx1-0.22, H-0.80) + ";")
    L.append(r"\node[text=inkblack] at " + pt(front_cx, H-1.24)
             + r" {\impact\fontsize{55}{55}\selectfont THE LAST};")
    L.append(r"\node[text=inkblack] at " + pt(front_cx, H-2.00)
             + r" {\impact\fontsize{55}{55}\selectfont HUMAN CEO};")
    L.append(r"\draw[inkblack,line width=1.6pt] " + pt(fx0+0.22, H-2.44) + " -- " + pt(fx1-0.22, H-2.44) + ";")
    L.append(r"\node[text=inkred] at " + pt(front_cx, H-2.64)
             + r" {\arial\bfseries\itshape\fontsize{12.5}{13}\selectfont a novel \textemdash{} by SPACE PIRATE ZERO};")
    burst(fx0+0.55, H-1.02, -8, 1.0, "inkyellow", "inkblack", 12, "35\textcent")
    burst(fx1-0.52, H-2.55, 10, 1.18, "inkred", "paperw", 8.5, "HASN'T\\\\SLEPT SINCE\\\\TUESDAY!")
    # the avalanche
    chip(fx0+0.95, H-3.30, -5, "inkyellow", "inkblack", 15, 16.5, 1.95,
         "COCAINE, CHARM \& MAYONNAISE!")
    chip(fx0+2.75, H-3.45, 3, "inkred", "paperw", 12, 13.5, 1.75,
         "TWELVE DAYS PAST SLEEP!")
    chip(fx0+0.85, H-4.22, -2, "paperw", "inkred", 11.5, 13, 2.0,
         "BOARDS DO THE MATH: ROBOT CHEAPER THAN A MAN!", border="inkblack")
    chip(fx0+2.65, H-4.38, 6, "inkblue", "paperw", 11, 12.5, 1.85,
         "MARGAUX: `THERE WAS NEVER ANYBODY HOME!'")
    chip(fx0+0.90, H-5.10, -8, "inkblack", "inkyellow", 12, 13.5, 1.9,
         "THE RIVER NEVER LIES AWAKE!")
    chip(fx0+2.60, H-5.20, 2, None, "inkred", 13.5, 15, 1.9,
         "8 MILLION SAW THE GAP!")
    chip(fx0+0.95, H-5.82, -3, "paperw", "inkblack", 10.5, 12, 2.05,
         "`I HAVE A BEATING HEART!' --- the 4 a.m. manifesto", border="inkblack")
    chip(fx0+2.80, H-5.95, 7, "inkyellow", "inkblack", 11, 12.5, 1.6,
         "ARE YOU A KEY-MAN RISK?")
    chip(fx1-1.30, H-6.42, 2, "inkblack", "paperw", 10.5, 12, 2.0,
         "SEE THE DRAWER WITH THE FALSE BACK!")
    chip(fx0+2.45, H-7.95, -2, "inkred", "paperw", 10.5, 11.5, 2.3,
         "MAYONNAISE KING WEEPS ON STAGE!")
    chip(fx0+0.80, H-8.02, 4, None, "inkblack", 9.5, 10.5, 1.5,
         "HE TIED HIS OWN BOW TIE!")
    chip(fx1-0.80, H-7.78, -10, None, "inkblack", 7.5, 8.5, 1.1,
         "what still turns in Defiance?", font=r"\atype")
    # bottom banner
    L.append(r"\fill[inkred] " + pt(fx0, 0) + " rectangle " + pt(W, 0.55) + ";")
    L.append(r"\node[text=paperw] at " + pt(front_cx, 0.34)
             + r" {\impact\fontsize{14.5}{16}\selectfont $\star$ BONUS EXTRA $\star$ \; THE NAMES ARE ON PAGE EIGHT};")

    # barcode keep-out, always last and always clean
    bqx2 = bx1 - 0.375
    bqx1 = bqx2 - 2.2
    bqy1 = BLEED + 0.30
    bqy2 = bqy1 + 1.4
    L.append(r"\fill[white] " + pt(bqx1, bqy1) + " rectangle " + pt(bqx2, bqy2) + ";")
    L.append(r"\node[text=inkblack] at " + pt((bqx1+bqx2)/2, (bqy1+bqy2)/2) + r" {\tiny barcode area};")

    L.append(r"\pgfresetboundingbox\path " + pt(0, 0) + " rectangle " + pt(W, H) + ";")
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

def build_epub():
    """Rebuild the EPUB3 from chapter markdown via pandoc, cover embedded."""
    import subprocess
    srcs = [os.path.join(KDP, "epub-metadata.yaml")]
    p0 = os.path.join(CHAP, "ch_00.md")
    if os.path.exists(p0):
        srcs.append(p0)
    srcs += [os.path.join(CHAP, f"ch_{i:02d}.md") for i in range(1, 29)
             if os.path.exists(os.path.join(CHAP, f"ch_{i:02d}.md"))]
    coda = os.path.join(CHAP, "ch_coda.md")
    if os.path.exists(coda):
        srcs.append(coda)
    cmd = ["pandoc", "-o", os.path.join(KDP, "the-last-human-ceo.epub"),
           "--css", os.path.join(KDP, "epub.css"), "--split-level=1"]
    cover = os.path.join(KDP, "ebook-cover.jpg")
    if os.path.exists(cover):
        cmd += ["--epub-cover-image", cover]
    subprocess.run(cmd + srcs, check=True)
    print("wrote kdp/the-last-human-ceo.epub")

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
    if "--epub" in sys.argv:
        build_epub()
    else:
        write_metadata(0)
        print("wrote kdp/metadata.md (run again with --pages N after building interior)")

if __name__ == "__main__":
    main()
