# Anatomy — autonovel (monorepo of books)

Map of the project. Check this before reading project files.

## What this repo is
An autonomous book-writing pipeline (seed → foundation → drafts → revision →
export). **As of the consolidation, `master` is a monorepo of books.** Each book
is a self-contained folder under `books/` carrying its own copy of the pipeline
tooling, foundation docs, chapters, and build artifacts. There is no longer a
shared framework at the repo root — the root holds only book-agnostic config.

## Books (under `books/`)
- `books/digital-insurgency/` — **Digital Insurgency**: business × cyberpunk ×
  spec-ops field manual. Was `master`/`autonovel/digital-insurgency`.
- `books/the-last-human-ceo/` — **The Last Human CEO**. Was
  `autonovel/the-last-human-ceo`. (A film/script `studio` treatment lives on the
  `autonovel/studio` branch, derived from this book.)
- `books/zero-trust-reality/` — **MISLABELED: contains a duplicate of The
  Last Human CEO**, not the planned nonfiction "Zero Trust Reality" (whose
  `book/` doc spine was never committed anywhere in git history; the
  `autonovel/zero-trust-reality` branch also holds LHCEO KDP work).
- `books/neko-death-cult/` — **Neko Death Cult**: gonzo time-slip cyberpunk;
  audio/album project (~377 MB of mp3/wav under `audio/`). Was previously only
  uncommitted work in a worktree; now committed here.

## Per-book shape
Each folder repeats the pipeline shape (evolved per book): foundation docs
(`voice.md`, `world.md`, `characters.md`, `outline.md`, `canon.md`), `chapters/`,
Python tooling (`run_pipeline.py`, `draft_chapter.py`, `evaluate.py`, `gen_*.py`,
`build_*.py`), and per-book `PIPELINE.md` / `WORKFLOW.md`. Read a given book's own
`README.md`/`PIPELINE.md` before diving in — details differ per book.

## Root (shared, book-agnostic)
- `.env.example` — API keys template (`ANTHROPIC_API_KEY` required; fal.ai +
  ElevenLabs optional).
- `pyproject.toml`, `uv.lock`, `.python-version` — Python env (uv).
- `.wolf/` — OpenWolf context.
- `README.md` — monorepo overview + shared pipeline design.

## Branch archives
Original per-book branches are retained as full-history archives:
`autonovel/digital-insurgency`, `autonovel/the-last-human-ceo`,
`autonovel/zero-trust-reality`, `autonovel/studio`, `autonovel/bells`.
