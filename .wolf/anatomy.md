# Anatomy — autonovel (branch: autonovel/digital-insurgency)

Map of the project. Check this before reading project files.

## What this repo is
An autonomous novel-writing pipeline (seed → foundation → drafts → revision →
export). Framework lives on `master`; each book is a branch. This branch is
**Digital Insurgency** — a business × cyberpunk × spec-ops field manual.

## Foundation layer (the five co-evolving docs the tools read)
- `voice.md`   — Part 1 universal anti-slop guardrails; Part 2 the SPZ voice.
- `world.md`   — 2027 cyberpunk Atlanta, PRISM, the Mesh, locations, the physics.
- `characters.md` — ZERO, GHOST, BISHOP, REAPER, COUNCIL + supporting cast.
- `outline.md` — Prologue + 16 chapters + appendices; beats; foreshadow ledger.
- `canon.md`   — hard facts + the 24 equations (evaluator constraints).
- `influences.md` — NEW layer: real figures (Wilde, Che, HST, Diogenes, Musashi,
  Mamdani, …) wired into `draft_chapter.py`. Used heavily, honestly.
- `seed.txt`   — master brief + the Chapter Format Template.

## Chapters
`chapters/ch_00.md` = Prologue (front matter). `ch_01..ch_16` = numbered chapters.
ch_04, ch_05 = full v0 drafts. Rest = scaffolds (full v0 prose for 6-16 in the
original brief, importable on request). Prologue + Ch1-3 originals in an external
.docx not in repo.

## Key tools (Python; run via `uv run python <tool>.py`)
- `run_pipeline.py` — orchestrator (phases: foundation/drafting/revision/export).
- `draft_chapter.py` — drafts one chapter; EDITED for this book + loads influences.md.
- `evaluate.py` — mechanical slop scorer + LLM judge.
- `review.py`, `reader_panel.py`, `adversarial_edit.py`, `apply_cuts.py`,
  `gen_brief.py`, `gen_revision.py` — revision loop.
- art: `gen_art*.py`, `gen_cover*.py`; audiobook: `gen_audiobook*.py`; export:
  `build_outline.py`, `build_arc_summary.py`, `typeset/`.

## State
`state.json` — phase=drafting, chapters_total=16, chapters_drafted=0. See its
`notes` array for the two run paths and the DO-NOT-regenerate-foundation warning.

## Config
`.env` (gitignored) needs `ANTHROPIC_API_KEY`
(https://console.anthropic.com/settings/keys). `AUTONOVEL_BOOK_TITLE` set.
fal.ai + ElevenLabs optional. `.env.example` is the committed template.
