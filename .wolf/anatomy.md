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
- **`UNIVERSE.md`** — shared-reality canon bible. Every book is a *transmission*
  from **Spaceship Alpha 9**, narrated by **Space Pirate Zero**. Holds the frame,
  the transmission ledger, the shared law, and the "add a new book" procedure.
  Read before writing/shipping any title.
- **`standards/`** — the repeatable cross-book production playbook. `README.md`
  (index + launch checklist) + `AUDIOBOOK.md` (manuscript→full-cast audiobook) +
  `PUBLISHING.md` (GCS + Cloud Run + RSS + Apple/Spotify + custom domain + SEO) +
  `SOCIAL.md` (images/video/teasers/press kit/copy) + `BRAND.md` (SPZ tokens).
  Reference implementation for all four: `books/the-last-human-ceo/` + `publishing/`.
- `brand/spz/` — the CANONICAL SPZ brand kit (palette/type/voice/sonic/storytelling
  JSON + `build_brand_kit.py` + `brand_kit.html` + `clips/` audio embedded in the
  kit). Do not fork. Build is repo-relative: fonts from `<repo>/fonts`, clips from
  `brand/spz/clips/`, output in place; override via `BRAND_KIT_FONTS`/`_CLIPS`/`_OUT`.
- `publishing/` — book-agnostic podcast+site publisher, driven by `config.json`
  (per-book show metadata, GCP target, `public_url` canonical domain).

## Branch archives
Original per-book branches are retained as full-history archives:
`autonovel/digital-insurgency`, `autonovel/the-last-human-ceo`,
`autonovel/zero-trust-reality`, `autonovel/studio`, `autonovel/bells`.

## Song production tools (neko-death-cult/tools/)
- `compose_songs.py` — regenerate album tracks via ElevenLabs composition_plan (era-forward, no static intro, mastered). Default sung duet (parses album.md lyrics); `--instrumental` for beats.
- `produce_song.py <door>` — full production: demucs-split the VOX song, find vocal-free pockets, place that door's spoken samples clean (intro thesis + mid + haunted outro), master. Output audio/produced/ep NN _song_FINAL.mp3.
