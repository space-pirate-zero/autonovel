# Anatomy — autonovel

Pipeline that drafts, revises, typesets, and packages novels. Current book:
"The Last Human CEO" (branch autonovel/the-last-human-ceo).

## Key areas
- `chapters/ch_01.md … ch_28.md, ch_coda.md, ch_00.md` — manuscript source (md). ch_00 = series epigraph.
- `typeset/build_kdp.py` — generates everything in `kdp/`: interior.tex, cover.tex (needs `--pages N`), epub assets, metadata.md, ebook-cover.jpg (crops front panel from cover.pdf via pdftoppm). Run: `python3 typeset/build_kdp.py --pages 325 --epub`.
- `typeset/fonts/` — vendored EB Garamond variable TTFs (OFL).
- `kdp/` — upload artifacts. Tracked: *.tex, metadata.md, epub.css, epub-metadata.yaml. Gitignored: *.pdf, *.epub, *.jpg (regenerable).
- Compile: `cd kdp && tectonic interior.tex` (and cover.tex). ePub built with pandoc (EPUB3).
- Validate ePub: `JAVA_HOME=/opt/homebrew/opt/openjdk PATH=/opt/homebrew/opt/openjdk/bin:$PATH epubcheck kdp/the-last-human-ceo.epub` (epubcheck needs Homebrew openjdk on PATH).

## Print constants (this book)
- Trim 6×9 in, WHITE paper, B&W, 295 pp → spine 0.6643 in (0.002252 in/pp). Set by KDP listing trim/paper; build_kdp.py top constants (TRIM_W/H, PAPER, SPINE_PER_PAGE) must match the KDP dashboard selection or the cover is rejected.
- Cover with bleed: 12.914 × 9.250 in. Gutter 0.875 in (exceeds KDP min for any page count).
- Copyright page intentionally omits ISBN (KDP assigns free one). If page count changes: re-run build with new `--pages`, recompile both tex files.
- KDP "expected cover size" = (trim + 0.125 bleed/edge) + spine(pages × paper-rate). Reverse-engineer a size-mismatch error from it: height−0.25→trim height; (width−0.25−2×trimW)→spine; spine/pages→paper rate (white .002252 / cream .0025). (Prev build was 5.5×8.5 cream 341pp = 12.1025×8.75, rejected because listing was 6×9 white.)
