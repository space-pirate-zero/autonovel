#!/usr/bin/env python3
"""
Build a print-ready LaTeX/PDF for THE LAST HUMAN CEO.

Reads chapters/ch_00.md (series epigraph), ch_01..ch_28.md, and
ch_coda.md. Renders each chapter's Space Pirate Zero "transmission"
opener (a leading Markdown blockquote) as a set-apart italic epigraph,
then the chapter prose with scene breaks and a drop cap.

Self-contained: emits typeset/lastceo.tex (one file), compile with
  tectonic typeset/lastceo.tex
Portable defaults (Latin Modern, no external fonts/art) so it always
compiles. Swap in EB Garamond later if desired.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CHAP = os.path.join(ROOT, "chapters")
OUT = os.path.join(HERE, "lastceo.tex")


def esc(t):
    t = t.replace('\\', r'\textbackslash{}')
    t = t.replace('&', r'\&').replace('%', r'\%').replace('$', r'\$')
    t = t.replace('#', r'\#').replace('_', r'\_')
    t = t.replace('{', r'\{').replace('}', r'\}')
    return t


def smart(s):
    # unicode punctuation -> TeX
    s = s.replace('—', '---').replace('–', '--')
    s = s.replace('“', '``').replace('”', "''")
    s = s.replace('‘', '`').replace('’', "'")
    s = s.replace('…', r'\ldots{}')
    # straight ASCII quotes
    s = re.sub(r'(?<=\s)"(?=\w)', '``', s)
    s = re.sub(r'^"(?=\w)', '``', s)
    s = re.sub(r'(?<=\w)"', "''", s)
    s = re.sub(r'(?<=[\.\?\!,])"', "''", s)
    s = s.replace('"', "''")
    return s


def inline(s):
    """Escape then apply *italics* -> \textit{...} and smart punctuation."""
    # protect italics spans first
    parts = re.split(r'(?<!\*)\*([^*]+)\*(?!\*)', s)
    out = []
    for i, p in enumerate(parts):
        if i % 2 == 1:
            out.append(r'\textit{' + smart(esc(p)) + '}')
        else:
            out.append(smart(esc(p)))
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
    # find first non-empty, non-scenebreak paragraph
    start = None
    for i, l in enumerate(lines):
        if l.strip() and not l.strip().startswith('\\scenebreak'):
            start = i
            break
    if start is None:
        return tex
    # gather first paragraph (until blank or scenebreak)
    para = []
    end = start
    for i in range(start, len(lines)):
        if lines[i].strip() == '' or lines[i].strip().startswith('\\scenebreak'):
            end = i
            break
        para.append(lines[i])
        end = i + 1
    text = ' '.join(para).lstrip()
    if len(text) < 2:
        return tex
    first = text[0]
    rest = text[1:]
    sp = rest.find(' ')
    if sp > 0:
        word_rest, para_rest = rest[:sp], rest[sp:]
    else:
        word_rest, para_rest = rest, ''
    drop = (r'\lettrine[lines=3, lhang=0.05, nindent=0.25em]{'
            + first + '}{' + word_rest + '}' + para_rest)
    return '\n'.join(lines[:start]) + '\n' + drop + '\n' + '\n'.join(lines[end:])


def parse_opener(block_lines):
    """block_lines: the '>' blockquote lines (already de-prefixed)."""
    ls = [l for l in block_lines]
    # strip leading/trailing empties
    while ls and ls[0].strip() == '':
        ls.pop(0)
    while ls and ls[-1].strip() == '':
        ls.pop()
    if not ls:
        return None
    header = ls[0].strip()
    signoff = ''
    if ls[-1].strip().startswith('*') and ls[-1].strip().endswith('*'):
        signoff = ls[-1].strip().strip('*').strip()
        body_lines = ls[1:-1]
    else:
        body_lines = ls[1:]
    body = ' '.join(x.strip() for x in body_lines if x.strip())
    return header, body, signoff


def transmission_tex(opener):
    header, body, signoff = opener
    h = smart(esc(header))
    b = inline(body)
    s = inline(signoff)
    out = [r'\begin{transmission}']
    out.append(r'{\transheader ' + h + r'}\par\vspace{0.5em}')
    out.append(b + r'\par')
    if s:
        out.append(r'\vspace{0.5em}\hfill\textit{' + s + r'}\par')
    out.append(r'\end{transmission}')
    return '\n'.join(out)


def split_chapter(text):
    """Return (title_line, opener_or_None, body)."""
    lines = text.strip('\n').split('\n')
    title = lines[0].lstrip('#').strip()
    rest = lines[1:]
    # skip blanks
    i = 0
    while i < len(rest) and rest[i].strip() == '':
        i += 1
    opener = None
    if i < len(rest) and rest[i].lstrip().startswith('>'):
        block = []
        while i < len(rest) and (rest[i].lstrip().startswith('>') or rest[i].strip() == ''):
            if rest[i].lstrip().startswith('>'):
                block.append(re.sub(r'^\s*>\s?', '', rest[i]))
            else:
                # blank line: stop if next isn't a quote
                nxt = rest[i+1] if i+1 < len(rest) else ''
                if not nxt.lstrip().startswith('>'):
                    i += 1
                    break
                block.append('')
            i += 1
        opener = parse_opener(block)
    # skip blanks and a leading '---' separator
    while i < len(rest) and rest[i].strip() == '':
        i += 1
    if i < len(rest) and rest[i].strip() == '---':
        i += 1
    body = '\n'.join(rest[i:]).strip('\n')
    return title, opener, body


def chapter_tex(path, numbered=True):
    with open(path) as f:
        text = f.read()
    title, opener, body = split_chapter(text)
    # title -> chapter name (strip "Chapter N — ")
    m = re.match(r'Chapter\s+\d+\s*[—-]\s*(.+)', title)
    name = m.group(1).strip() if m else title
    btex = drop_cap(body_to_tex(body))
    head = (r'\chapter{' + esc(name) + '}') if numbered else (
        r'\chapter*{' + esc(name) + r'}\addcontentsline{toc}{chapter}{'
        + esc(name) + r'}\markboth{' + esc(name).upper() + '}{}')
    trans = transmission_tex(opener) + '\n\n' if opener else ''
    return head + '\n\n' + trans + btex + '\n'


def front_epigraph(path):
    """ch_00: title + series transmission epigraph as front matter."""
    with open(path) as f:
        text = f.read()
    _, opener, _ = split_chapter(text)
    if not opener:
        return ''
    header, body, signoff = opener
    b = inline(body)
    s = inline(signoff)
    return ('\\thispagestyle{empty}\n\\vspace*{1.6in}\n'
            '\\begin{center}\\begin{minipage}{3.4in}\n'
            '\\itshape\\small\\setlength{\\parindent}{0pt}\\setstretch{1.15}\n'
            + b + '\\par\\vspace{0.8em}\\hfill ' + (s and '\\textrm{\\footnotesize ' + s + '}') + '\n'
            '\\end{minipage}\\end{center}\n\\clearpage\n')


PREAMBLE = r"""\documentclass[11pt,openany]{book}
\usepackage[paperwidth=5.5in,paperheight=8.5in,inner=0.85in,outer=0.65in,top=0.8in,bottom=0.85in,headheight=14pt]{geometry}
\usepackage{microtype}
\usepackage{setspace}
\setstretch{1.13}
\setlength{\parindent}{1.4em}
\usepackage{lettrine}
\usepackage{titlesec}
\usepackage{fancyhdr}
\usepackage{hyperref}
\hypersetup{pdftitle={The Last Human CEO},pdfauthor={Space Pirate Zero},hidelinks}

% transmission opener style
\newcommand{\transheader}{\normalfont\footnotesize\scshape\letterspace}
\newcommand{\letterspace}{}
\newenvironment{transmission}{%
  \par\vspace{0.3\baselineskip}\begin{center}\begin{minipage}{0.88\textwidth}%
  \itshape\small\setlength{\parindent}{0pt}\setstretch{1.06}}%
  {\end{minipage}\end{center}\vspace{0.4\baselineskip}%
  \noindent\hfil\rule{0.35\textwidth}{0.3pt}\hfil\par\vspace{1.0\baselineskip}}

% scene break
\newcommand{\scenebreak}{\par\vspace{0.5\baselineskip}\begin{center}\textasteriskcentered\quad\textasteriskcentered\quad\textasteriskcentered\end{center}\vspace{0.5\baselineskip}\par}

% chapter style
\titleformat{\chapter}[display]
  {\normalfont\centering}
  {\vspace*{1.1in}\footnotesize\textsc{chapter \thechapter}}
  {6pt}{\Large\itshape}[\vspace{8pt}{\small--- $\diamond$ ---}\vspace{0.4in}]
\titlespacing*{\chapter}{0pt}{0pt}{0pt}
\renewcommand{\chaptermark}[1]{\markboth{#1}{}}

\pagestyle{fancy}\fancyhf{}
\fancyhead[LE]{\small\textsc{the last human ceo}}
\fancyhead[RO]{\small\textit{\leftmark}}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\fancypagestyle{plain}{\fancyhf{}\fancyfoot[C]{\thepage}\renewcommand{\headrulewidth}{0pt}}

\begin{document}
\frontmatter

% half title
\thispagestyle{empty}\vspace*{3in}
\begin{center}{\large\textsc{The Last Human CEO}}\end{center}\clearpage
\thispagestyle{empty}\mbox{}\clearpage

% title page
\thispagestyle{empty}\begin{center}\vspace*{1.8in}
{\small\textsc{the}}\\[0.12in]
{\Huge\textsc{Last Human CEO}}\\[0.45in]
{\small------\quad$\diamond$\quad------}\\[0.4in]
{\large\textit{A Novel}}\\[1.0in]
{\Large\textsc{Space Pirate Zero}}\\[0.3in]
{\footnotesize\textit{transmitting from Spaceship Alpha 9}}\\[1.2in]
\end{center}\clearpage

% colophon
\thispagestyle{empty}\vspace*{\fill}\begin{center}
{\small This is a work of fiction.}\\[4pt]
{\small Grounded in the \textit{Last Human CEO} essay series.}\\[10pt]
{\small A tragic dark comedy.}
\end{center}\vspace*{\fill}\clearpage
"""

POST_FRONT = r"""\mainmatter
"""

ENDMATTER = r"""\backmatter
\thispagestyle{empty}\vspace*{3in}
\begin{center}{\small------\quad$\diamond$\quad------}\\[0.3in]
{\small\textit{Keep it tuned.}}\end{center}
\end{document}
"""


def main():
    parts = [PREAMBLE]
    # series epigraph from ch_00
    ch00 = os.path.join(CHAP, 'ch_00.md')
    if os.path.exists(ch00):
        parts.append(front_epigraph(ch00))
    parts.append(POST_FRONT)
    # numbered chapters
    n = 0
    for i in range(1, 29):
        p = os.path.join(CHAP, f'ch_{i:02d}.md')
        if os.path.exists(p):
            parts.append('\\clearpage\n' + chapter_tex(p, numbered=True))
            n += 1
            print(f"  ch_{i:02d}")
    # coda
    coda = os.path.join(CHAP, 'ch_coda.md')
    if os.path.exists(coda):
        parts.append('\\clearpage\n' + chapter_tex(coda, numbered=False))
        print("  ch_coda")
    parts.append(ENDMATTER)
    with open(OUT, 'w') as f:
        f.write('\n'.join(parts))
    print(f"\nWrote {OUT} ({n} numbered chapters + coda)")


if __name__ == '__main__':
    main()
