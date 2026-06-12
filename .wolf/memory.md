# Memory log

## 2026-06-10 — KDP preflight pass (The Last Human CEO)
- Removed printed ISBN placeholder `979-8-XXXXXXX-X-X` from copyright page (source fix in typeset/build_kdp.py; interior.tex regenerated; still 321 pp so spine/cover unchanged).
- Embedded front cover into the ePub (manifest `properties="cover-image"` + legacy `<meta name="cover">`, no cover XHTML to avoid Kindle double-cover). epubcheck 3.3: 0 errors/0 warnings.
- Added `write_ebook_cover()` to build_kdp.py — crops front panel of cover.pdf at 300 dpi → kdp/ebook-cover.jpg (1650×2550 RGB) for the KDP eBook cover upload.
- Added kdp/*.jpg to .gitignore (matches existing convention: generated binaries untracked).
- Commit: aa03542.

## 2026-06-10 — Full audit + darkness pass (The Last Human CEO)
- 10-agent audit (6 visual over all 321 pp + cover, 4 literary over the manuscript).
- Typesetting fixes in build_kdp.py: drop-cap join for short openers, dquotes()
  context-aware quote pass, machineblock env for mid-body blockquotes,
  \frenchspacing, widow/club penalties + \raggedbottom, scene-break keep rules,
  \emergencystretch=2.5em (0 overfull lines), dispfont Ligatures=TeX, backmatter
  line now "End of transmission." Cover: barcode box 2.2x1.4, spine rules inset
  0.09in full-bleed [overlay], titlefont WordSpace=1.45.
- Continuity: fire moved to Jan 2022 (deaths now FOLLOW the eleven-minute
  decision), Marcus pre-access codas rewritten to public-record + sealed-gap,
  master clock conformed (gala Aug 2027 -> collapse Sep 2028 -> finale Sep 2029),
  Voss/Okonjo genders, Halloran first name, AO designation harmonized as
  substitution-before-execution, 61-page settlement, Pip reveal in Aerie+hospital,
  ninety-five years, ages 55/56.
- Darkness pass on the ending: prison gun FIRED (30 months, Marion, report date
  26 days after ch_28 gala; coda states it flat with day-rate arithmetic),
  Marcus's letter de-souled ("I am not telling you it was good... it was the
  only one"; "No response is sought, and none will be read"), validation chorus
  cut to Sun's knife, ch_26 closing-line failure + ambient-despair train, ch_25
  near-relapse + Okonjo bills, Margaux's card ("Thirty months is not what they
  cost"), coda consolations stripped.
- New page count 325 -> spine 0.8125in, cover 12.0625x8.75. All rebuilt; epubcheck
  0/0; fonts embedded; build now does `--epub` via pandoc with embedded cover.

## 2026-06-11 — Gemini art backend + tabloid cover (The Last Human CEO)
- gen_art.py: added gemini_generate() (REST, model fallback gemini-3.1-flash-image-preview
  -> gemini-2.5-flash-image, 4K/aspect mapping, 429 backoff, ref_images for edit) and
  backend-agnostic art_generate/art_edit/save_image; ART_BACKEND auto-picks gemini when
  GEMINI_API_KEY set (key lives in gitignored .env). fal path kept.
- Cover redesigned as 1960s scandal tabloid (user-directed): cover_tex() fully replaced.
  Real type (Impact/Arial Black/American Typewriter/EB Garamond, system fonts embedded OK),
  5 Gemini halftone assets in art/cover/ (cope_toast, cope_shield, machine_board,
  pinwheel_spot color spot photo, paper_bg). Headlines all book-accurate. Barcode keep-out
  2.2x1.4 white. Spine = red band, white Impact. \pgfresetboundingbox guards page size.
- ebook-cover.jpg + epub cover regenerate automatically; epubcheck 0/0; all fonts embedded.
- Old pinwheel-void cover art gitignored (art/cover/wrap_*.png), tabloid assets tracked.
- WATCH: run builds from repo root — cd kdp persists across Bash calls and silently breaks
  typeset/build_kdp.py invocations.

## 2026-06-11 — Ten vintage tabloid covers (press-clippings dossier)
- typeset/build_tabloids.py: parameterized generator -> art/tabloids/tabloids.pdf,
  ten 8.5x11 scandal-mag covers charting Cope's arc (Aug 2027 -> Oct 2029), one per
  headline. Rotating mastheads (Boardroom Confidential, Hush-Hush, Inside Story, Top
  Secret, Whisper, Photoplay Confessions, The National Ledger, Commerce Gazette,
  Lowdown, Exposed!). All type live (Impact/Arial/American Typewriter); fit() auto-
  shrinks single-line headlines (0.46em/char Impact heuristic).
- 4 new Gemini assets in art/tabloids/: cope_mirror, cope_weep, plane_girl, margaux
  (color movie-mag). GOTCHA: python non-raw "\textemdash" in specs = TAB+extemdash;
  use r-strings or --- ligatures in spec text.
