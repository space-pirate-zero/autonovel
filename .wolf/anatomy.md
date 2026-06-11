# Anatomy — autonovel

Pipeline that drafts, revises, typesets, and packages novels. Current book:
"The Last Human CEO" (branch autonovel/the-last-human-ceo).

## Key areas
- `chapters/ch_01.md … ch_28.md, ch_coda.md, ch_00.md` — manuscript source (md). ch_00 = series epigraph.
- `typeset/build_kdp.py` — generates everything in `kdp/`: interior.tex, cover.tex (needs `--pages N`), epub assets, metadata.md, ebook-cover.jpg (crops front panel from cover.pdf via pdftoppm). Run: `python3 typeset/build_kdp.py --pages 321`.
- `typeset/fonts/` — vendored EB Garamond variable TTFs (OFL).
- `kdp/` — upload artifacts. Tracked: *.tex, metadata.md, epub.css, epub-metadata.yaml. Gitignored: *.pdf, *.epub, *.jpg (regenerable).
- Compile: `cd kdp && tectonic interior.tex` (and cover.tex). ePub built with pandoc (EPUB3).
- Validate ePub: `JAVA_HOME=/opt/homebrew/opt/openjdk PATH=/opt/homebrew/opt/openjdk/bin:$PATH epubcheck kdp/the-last-human-ceo.epub` (epubcheck needs Homebrew openjdk on PATH).

## Print constants (this book)
- Trim 5.5×8.5 in, cream paper, B&W, 321 pp → spine 0.8025 in (0.0025 in/pp).
- Cover with bleed: 12.0525 × 8.75 in. Gutter 0.875 in (meets KDP 301–500 pp min).
- Copyright page intentionally omits ISBN (KDP assigns free one). If page count changes: re-run build with new `--pages`, recompile both tex files.
