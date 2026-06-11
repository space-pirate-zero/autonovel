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

# ---------- COVER (1960s scandal-tabloid design) ----------
def cover_tex(pages):
    spine = pages * SPINE_PER_PAGE
    W = 2*BLEED + 2*TRIM_W + spine
    H = 2*BLEED + TRIM_H
    bx0 = BLEED                  # back panel trim left
    bx1 = BLEED + TRIM_W         # spine left fold
    fx0 = bx1 + spine            # front panel trim left
    fx1 = fx0 + TRIM_W           # front panel trim right
    front_cx = (fx0 + fx1) / 2
    back_cx = (bx0 + bx1) / 2
    spine_cx = bx1 + spine/2

    def p(v): return f"{v:.4f}"
    def pt(x, y): return "(" + p(x) + "," + p(y) + ")"

    blurb = (r"It is 2027, and the boards have done the math. One by one, the "
             r"Fortune 100 is firing its chief executives and installing an "
             r"artificial intelligence that is cheaper, sharper, and---most "
             r"unforgivably---incapable of a scandal.\par\smallskip "
             r"Prescott `Cope' Mercer IV is the last human CEO left in the "
             r"consumer economy: a fourth-generation heir, a charmer, a "
             r"cokehead, a man who long ago mistook being obeyed for being "
             r"loved. As an unkillably ethical machine named Marcus moves "
             r"into his chair, Cope launches a manic crusade to prove a human "
             r"still belongs at the top---right until the machine, doing "
             r"nothing but its dull honest job, opens the drawer where he "
             r"buried the thing that got two people killed.\par\smallskip "
             r"\textbf{A tragic dark comedy about the last man to confuse a "
             r"throne for a soul.}")

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

    # ---- background: aged newsprint, full bleed ----
    L.append(r"\fill[paperw] " + pt(0, 0) + " rectangle " + pt(W, H) + ";")
    if os.path.exists(os.path.join(ROOT, "art", "cover", "paper_bg.png")):
        L.append(r"\node[anchor=south west] at " + pt(0, 0)
                 + r" {\includegraphics[width=" + p(W) + "in,height=" + p(H)
                 + r"in]{../art/cover/paper_bg.png}};")

    PH = "../art/cover/"

    # ================= FRONT PANEL =================
    # top kicker banner (runs into top/right bleed)
    L.append(r"\fill[inkred] " + pt(fx0, H-0.62) + " rectangle " + pt(W, H) + ";")
    L.append(r"\node[text=paperw] at " + pt(front_cx, H-0.345)
             + r" {\impact\fontsize{15.5}{17}\selectfont SEE WHAT MERCER PAID \$14.2 MILLION TO HIDE!};")

    # masthead
    L.append(r"\draw[inkblack,line width=1.6pt] " + pt(fx0+0.22, H-0.78) + " -- " + pt(fx1-0.22, H-0.78) + ";")
    L.append(r"\node[text=inkblack] at " + pt(front_cx, H-1.22)
             + r" {\impact\fontsize{55}{55}\selectfont THE LAST};")
    L.append(r"\node[text=inkblack] at " + pt(front_cx, H-1.98)
             + r" {\impact\fontsize{55}{55}\selectfont HUMAN CEO};")
    L.append(r"\draw[inkblack,line width=1.6pt] " + pt(fx0+0.22, H-2.42) + " -- " + pt(fx1-0.22, H-2.42) + ";")
    L.append(r"\node[text=inkred] at " + pt(front_cx, H-2.62)
             + r" {\arial\bfseries\itshape\fontsize{12.5}{13}\selectfont a novel \textemdash{} by SPACE PIRATE ZERO};")
    L.append(r"\node[text=inkblack] at " + pt(front_cx, H-2.86)
             + r" {\atype\fontsize{7.5}{8}\selectfont 95th AND FINAL YEAR OF PUBLICATION \quad\textbullet\quad DEFIANCE, OHIO};")
    # price bubble
    L.append(r"\fill[paperw] " + pt(fx0+0.52, H-1.05) + " circle (0.30);")
    L.append(r"\draw[inkblack,line width=1.1pt] " + pt(fx0+0.52, H-1.05) + " circle (0.30);")
    L.append(r"\node[text=inkblack] at " + pt(fx0+0.52, H-1.05)
             + r" {\ablack\fontsize{13}{13}\selectfont 35\textcent};")

    # main photo: the toast (right side), tilted
    L.append(r"\node[rotate=-2.5] at " + pt(fx1-1.32, H-4.78)
             + r" {\includegraphics[width=2.35in]{" + PH + "cope_toast.png}};")
    L.append(r"\fill[paperw] " + pt(fx1-2.52, H-6.86) + " rectangle " + pt(fx1-0.12, H-6.42) + ";")
    L.append(r"\draw[inkblack,line width=0.5pt] " + pt(fx1-2.52, H-6.86) + " rectangle " + pt(fx1-0.12, H-6.42) + ";")
    L.append(r"\node[text=inkblack,align=center,text width=2.25in] at " + pt(fx1-1.32, H-6.64)
             + r" {\atype\fontsize{7.2}{8.4}\selectfont TOAST OF THE CENTURY? Mercer, moments before the arithmetic.};")

    # left headline stack
    lx = fx0 + 0.24
    lw = 2.30
    lcx = lx + lw/2
    # 1) yellow box
    L.append(r"\fill[inkyellow] " + pt(lx, H-4.12) + " rectangle " + pt(lx+lw, H-3.08) + ";")
    L.append(r"\node[text=inkblack,align=center,text width=2.05in] at " + pt(lcx, H-3.60)
             + r" {\impact\fontsize{16.5}{18}\selectfont COCAINE, CHARM \& MAYONNAISE!};")
    # 2) red on paper
    L.append(r"\node[text=inkred,align=center,text width=2.3in] at " + pt(lcx, H-4.62)
             + r" {\impact\fontsize{15}{16.5}\selectfont BOARDS DO THE MATH: ROBOT BOSS CHEAPER THAN A MAN!};")
    # 3) blue box
    L.append(r"\fill[inkblue] " + pt(lx, H-6.10) + " rectangle " + pt(lx+lw, H-5.10) + ";")
    L.append(r"\node[text=paperw,align=center,text width=2.15in] at " + pt(lcx, H-5.60)
             + r" {\impact\fontsize{13.5}{15}\selectfont MARGAUX TELLS ALL: `THERE WAS NEVER ANYBODY HOME!'};")
    # 4) black quote
    L.append(r"\node[text=inkblack,align=center,text width=2.3in] at " + pt(lcx, H-6.34)
             + r" {\impact\fontsize{14}{15.5}\selectfont `I HAVE A BEATING HEART!'};")
    L.append(r"\node[text=inkred,align=center,text width=2.3in] at " + pt(lcx, H-6.62)
             + r" {\arial\bfseries\itshape\fontsize{9.5}{10.5}\selectfont the 4 a.m. manifesto that finished him};")

    # pinwheel spot photo, bottom left of front
    L.append(r"\node[rotate=2] at " + pt(fx0+0.86, H-7.56)
             + r" {\includegraphics[width=1.02in]{" + PH + "pinwheel_spot.png}};")
    L.append(r"\node[text=inkblack,align=left,text width=2.05in,anchor=west] at " + pt(fx0+1.52, H-7.56)
             + r" {\atype\fontsize{7.5}{9}\selectfont WHAT STILL TURNS IN DEFIANCE \textemdash{} and who keeps planting it? SEE BACK};")

    # Tisch quote box (lower right)
    L.append(r"\draw[inkblack,line width=1pt] " + pt(fx1-2.42, 0.80) + " rectangle " + pt(fx1-0.10, 1.72) + ";")
    L.append(r"\node[text=inkblack,align=center,text width=2.1in] at " + pt(fx1-1.26, 1.40)
             + r" {\impact\fontsize{11.5}{13}\selectfont `THE WITHHELD TEAR OUT-PERFORMS THE TEAR BY 12 POINTS!'};")
    L.append(r"\node[text=inkred,align=center,text width=2.1in] at " + pt(fx1-1.26, 0.97)
             + r" {\arial\bfseries\itshape\fontsize{8.5}{9}\selectfont \textemdash{} his \$200,000-a-month image doctor};")

    # bottom banner (runs into bottom/right bleed)
    L.append(r"\fill[inkred] " + pt(fx0, 0) + " rectangle " + pt(W, 0.55) + ";")
    L.append(r"\node[text=paperw] at " + pt(front_cx, 0.34)
             + r" {\impact\fontsize{14.5}{16}\selectfont $\star$ BONUS EXTRA $\star$ \; THE NAMES ARE ON PAGE EIGHT};")

    # ================= SPINE =================
    L.append(r"\fill[inkred] " + pt(bx1, 0) + " rectangle " + pt(fx0, H) + ";")
    if spine >= 0.0625:
        L.append(r"\node[rotate=-90,text=paperw] at " + pt(spine_cx, BLEED+TRIM_H/2)
                 + r" {\impact\fontsize{13}{13}\selectfont THE LAST HUMAN CEO \quad$\star$\quad SPACE PIRATE ZERO};")

    # ================= BACK PANEL =================
    # top black band
    L.append(r"\fill[inkblack] " + pt(0, H-0.92) + " rectangle " + pt(bx1, H) + ";")
    L.append(r"\node[text=paperw] at " + pt(back_cx, H-0.50)
             + r" {\impact\fontsize{23}{24}\selectfont HOW LONG CAN COPE KEEP IT UP?};")
    L.append(r"\node[text=inkred,align=center,text width=4.9in] at " + pt(back_cx, H-1.32)
             + r" {\impact\fontsize{16.5}{18}\selectfont TWO DEAD IN DEFIANCE \textemdash{} WHAT DID THE MAYONNAISE KING KNOW?};")

    # photos: machine boardroom (left), shield shot (right)
    L.append(r"\node[rotate=1.5] at " + pt(bx0+1.45, H-3.05)
             + r" {\includegraphics[width=2.55in]{" + PH + "machine_board.png}};")
    L.append(r"\node[text=inkblack,align=center,text width=2.4in] at " + pt(bx0+1.45, H-4.18)
             + r" {\atype\fontsize{7.2}{8.4}\selectfont EXCLUSIVE PHOTO: the new chief executive takes the chair. It was not close.};")
    L.append(r"\node[rotate=-2] at " + pt(bx1-1.30, H-3.30)
             + r" {\includegraphics[width=1.78in]{" + PH + "cope_shield.png}};")
    L.append(r"\node[rotate=-8,text=paperw,fill=inkred,inner sep=2.5pt] at " + pt(bx1-1.30, H-3.35)
             + r" {\impact\fontsize{12}{12}\selectfont NO COMMENT!};")
    L.append(r"\node[text=inkblack,align=center,text width=1.8in] at " + pt(bx1-1.30, H-4.78)
             + r" {\atype\fontsize{7.2}{8.4}\selectfont CAUGHT! Leaving Wilmington with eleven minutes to explain.};")

    # blurb box
    L.append(r"\fill[paperw] " + pt(bx0+0.28, 1.95) + " rectangle " + pt(bx1-0.28, H-4.98) + ";")
    L.append(r"\draw[inkblack,line width=0.8pt] " + pt(bx0+0.28, 1.95) + " rectangle " + pt(bx1-0.28, H-4.98) + ";")
    L.append(r"\node[text=inkblack,anchor=north,align=center,text width=4.5in] at " + pt(back_cx, H-5.08)
             + r" {\impact\fontsize{12.5}{13.5}\selectfont THE STORY THEY COULDN'T SETTLE:};")
    L.append(r"\node[text=inkblack,anchor=north,align=left,text width=4.5in] at " + pt(back_cx, H-5.40)
             + r" {\atype\fontsize{7.3}{9.2}\selectfont " + blurb + r"};")

    # bottom-left lines
    L.append(r"\node[text=inkred,anchor=south west,align=left,text width=2.35in] at " + pt(bx0+0.30, 0.78)
             + r" {\atype\fontsize{8.5}{10}\selectfont CHEMIST'S REPORT: thirty months is not what they cost.};")
    L.append(r"\node[text=inkblack,anchor=south west,align=left,text width=2.35in] at " + pt(bx0+0.30, 0.32)
             + r" {\atype\fontsize{7.5}{8.5}\selectfont FICTION / SATIRE \textbullet{} SPACESHIP ALPHA 9};")

    # barcode keep-out (KDP prints a 2.0 x 1.2 in barcode here)
    bqx2 = bx1 - 0.375
    bqx1 = bqx2 - 2.2
    bqy1 = BLEED + 0.30
    bqy2 = bqy1 + 1.4
    L.append(r"\fill[white] " + pt(bqx1, bqy1) + " rectangle " + pt(bqx2, bqy2) + ";")
    L.append(r"\node[text=inkblack] at " + pt((bqx1+bqx2)/2, (bqy1+bqy2)/2) + r" {\tiny barcode area};")

    # exact page bounding box regardless of stroke/photo overhang
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
