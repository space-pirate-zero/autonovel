# Memory — autonovel (append-only log)

## 2026-06-04 — Digital Insurgency setup
- Created branch `autonovel/digital-insurgency`.
- Hand-authored the foundation from the seed bible: world.md, characters.md,
  outline.md (Prologue + 16 ch + appendices, `### Ch N:` headers), voice.md
  (Part 1 preserved; Part 2 = SPZ voice), canon.md (24 equations + hard facts).
- Added NEW `influences.md` (20 real figures) and wired it into draft_chapter.py
  (loads influences.md + seed.txt; retargeted from the fantasy book; system
  prompt + body rewritten for the spec-ops chapter format; BOOK_TITLE env added).
- Wrote seed.txt (master brief + Chapter Format Template).
- Chapters: ch_00-03 scaffolds (Prologue+Ch1-3, originals in external .docx);
  ch_04, ch_05 full v0 drafts imported; ch_06-16 scaffolds (v0 prose importable).
- state.json: phase=drafting, total=16, drafted=0, with run-path notes.
- .env created from example (gitignored); ANTHROPIC_API_KEY still a placeholder —
  user to add from console.anthropic.com.
- Bootstrapped this .wolf/ directory (did not exist before).

## 2026-06-04 — Pipeline run attempt (blocked on billing)
- API key added to .env (gitignored). Smoke test: key AUTHENTICATES; models
  claude-sonnet-4-6 and claude-opus-4-8 both VALID. Set REVIEW model to
  claude-opus-4-8 (was claude-opus-4-6, unconfirmed).
- BLOCKER: account has zero API credit ("credit balance is too low"). Pipeline
  not launched. User must add credits at console.anthropic.com/settings/billing.
- Run command when unblocked: `uv run python run_pipeline.py` (resumes at
  phase=drafting -> drafting/revision/export; skips foundation). Drafting loop is
  ch_01..ch_16; Prologue ch_00 is front matter, drafted separately.

## 2026-06-05 — Pipeline COMPLETE
- Switched all models to claude-opus-4-8 (env + every hardcoded default).
- Fixed Opus-incompatible 'temperature' param (logged in buglog.json).
- Full autonomous run: drafting (16 ch, some 2-5 attempts to clear 6.0 gate) ->
  3 revision cycles (plateau at novel_score 7.0) -> 4 Opus review rounds
  (which rewrote the Prologue ch_00 from scaffold into finished prose) -> export.
- RESULT: Prologue + 16 chapters, 58,070 words, novel_score 7.0, ~1.9 hrs.
  manuscript.md (58,086 w) built. No PDF (tectonic not installed).
- NOT done (optional/separate): Appendices A-C; art (needs FAL_KEY); audiobook
  (needs ELEVENLABS_API_KEY); PDF (needs `brew install tectonic`).

## 2026-06-05 — Appendices + PDF
- Authored Appendices A (24-equation cheatsheet), B (Infiltration Canvas), C
  (companion-app spec) directly -> chapters/ch_17,18,19.md.
- PDF: repo typeset/build_tex.py is prose-only (escapes $, breaks math/tables)
  AND has hardcoded /home/jeffq paths. Used pandoc + tectonic instead via new
  build_pdf.py (emoji/unicode -> safe text, strips [IMG] markers).
- RESULT: build/Digital_Insurgency.pdf — 154 pages, ~577KB, 61,120 words
  (Prologue + 16 ch + 3 appendices). *.pdf is gitignored so the PDF is local only.

## 2026-06-05 — INSURGENT design system PDF
- Built custom XeLaTeX/tectonic design: void #030303 pages, Orbitron (display),
  Space Grotesk (body), JetBrains Mono (code), pink chapter titles, cyan math,
  color-coded section banners (SITREP red, BROADCAST/MIRROR pink, BOSS amber,
  KEY MISSION acid, SPZ orange, GLOSSARY/BRIEFING cyan), colored GREEN/YELLOW/RED
  benchmarks. Files: fonts/ (OFL TTFs), design/{preamble.tex,sections.lua,cover.tex},
  build_design_pdf.py.
- Gotchas fixed: global \defaultfontfeatures{Path} hijacked the math-font lookup
  (use per-font Path=); \RaggedRight needs ragged2e (used \raggedright).
- OUTPUT: build/Digital_Insurgency_Designed.pdf — 146 pages, ~600KB. Verified by
  rendering pages with pdftoppm. (*.pdf gitignored -> local only.)
- Two PDFs now: build_pdf.py (plain/light) and build_design_pdf.py (INSURGENT).

## 2026-06-05 — Polish pass (net +1 to 8.0) + companion-app removal
- Removed companion app: deleted Appendix C (ch_19) + scrubbed all refs (pillars
  3->2, world/outline/seed/ch_16 end marker).
- Polish pass (run_pipeline --phase revision, appendices held out): cycle 4 lifted
  novel_score 7.0->8.0; cycle 5 regressed to 7.0 and apply_cuts DAMAGED ch_16
  (see buglog). Resolution: reset prose to cycle-4 peak (7c9a2f8, 8.0), hand-repaired
  ch_16, restored appendices, precise damage scan = 0 flags.
- FINAL: Prologue + 16 ch + Appendices A,B; 59,166 words; novel_score 8.0.
  Rebuilt all 3: build/Digital_Insurgency.pdf (plain), _Designed.pdf (INSURGENT),
  .epub. All gitignored (local).

## 2026-06-05 — Concise TOC + cover date 2026
- TOC: now chapters-only. Mechanism: sections.lua tags every non-banner heading
  {.unnumbered .unlisted} so pandoc emits \section* with no \addcontentsline ->
  only \dichapter chapter lines reach the .toc. cover.tex uses \@starttoc{toc}
  (not \tableofcontents) so the CONTENTS header + list sit on one page.
  Dead-ends learned: lowering tocdepth (0/1) blanks chapters in this class
  (l@chapter renders only at tocdepth>=2); \l@section/\l@subsection no-op override
  breaks chapter rendering too. Don't use those.
- Cover/publication date 2027 -> 2026 in design/cover.tex, build_pdf.py YAML,
  build_epub.py metadata (prose stays 2027 = in-story year).
- Rebuilt all 3 (plain PDF, designed PDF, epub).

## 2026-06-05 — Equations: real LaTeX + boxed
- Problem: most equations were plain **bold ASCII** (e.g. **F_g = (Sunk_Cost × ...)**),
  rendered as weak bold text, not math.
- convert_equations.py: replaced 32 bold/Formula equation DEFINITION lines across
  chapters with canonical $$ LaTeX (dict keyed by symbol; conservative — single '=',
  RHS starts with var/'(' not a number, so numeric field reports + glossary mentions
  are untouched). Now ~59 $$ display-math lines total (incl. Appendix A's 24).
- Stand-out treatment: design \eqbox (cyan \fcolorbox on panel bg) + sections.lua
  Para handler wraps any single-DisplayMath para in it. epub.css boxes
  math[display="block"] (pandoc --mathml emits that, no .math.display class).
  Plain PDF: real centered LaTeX (unboxed, minimal variant).
- Verified by rendering p18 (F_g, E_tax boxed fractions, cyan). Rebuilt all 3.
