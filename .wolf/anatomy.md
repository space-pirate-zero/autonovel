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
- `books/zero-trust-reality/` — **Zero Trust Reality**: nonfiction. Was
  `autonovel/zero-trust-reality`.
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
- `publishing/` — **book-agnostic distribution pipeline** (added 2026-07-07). One
  local pipeline: push audio to GCS (`gs://sa9-podcasts`, project `stylelift`) and
  regenerate one RSS feed per show; Apple/Spotify/etc. subscribe to that feed (they
  are directories, not upload targets). Layout: `config.yaml` (per-show metadata +
  episode titles), `core/` (config, manifest, feed via `feedgen`, gcs, publisher),
  `core/substack_client.py` (unofficial python-substack), `core/db.py` (SQLite),
  `analytics/{apple,collect}.py` (Apple Podcasts Connect ES256 JWT + collectors),
  `servers/{publish,substack,analytics}_server.py` (3 FastMCP servers),
  `cli.py` (same ops on the terminal, `--dry-run` aware),
  `dashboard/{app.py,static/index.html}` (FastAPI on :8777, dark SA9 theme),
  `README.md` (Phase 0 setup + manual directory-submission checklist + .env keys).
  State (manifests, feeds, analytics.sqlite) in gitignored `publishing/.state/`.
  Phases 1–4 built & verified offline; Phase 5 (Cloud Run download-counter) unbuilt.
  Substack/Apple need creds in .env to actually run; everything degrades gracefully.
  NOTE: the MCP-server dir is `servers/` NOT `mcp/` — a dir named `mcp` shadows the
  installed `mcp` package and breaks `from mcp.server.fastmcp import FastMCP`.

## Branch archives
Original per-book branches are retained as full-history archives:
`autonovel/digital-insurgency`, `autonovel/the-last-human-ceo`,
`autonovel/zero-trust-reality`, `autonovel/studio`, `autonovel/bells`.
