# Anatomy — Spaceship Alpha 9 studio repo (autonovel)

Map of the repo. Check this before reading project files. Updated 2026-07-15.

## What this repo is
**The studio repo** for Spaceship Alpha 9 / Space Pirate Zero: books,
podcasts, album, publishing pipelines, socials, marketing, brand, and
book-related web experiences. `master` is a monorepo — each book is
self-contained under `books/<name>/` with its own copy of the autonovel
pipeline. Front door: `README.md` → `docs/` → `RULES.md` → `CLAUDE.md`.

## Studio documentation set
- `README.md` — studio front page (catalog, map, production line).
- `CLAUDE.md` — AI context entry point (read order, ground truth, shortcuts).
- `RULES.md` — enforceable studio rules (canon/voice/brand/sonic/pipeline/
  publishing/assets/hygiene/content lines), each with a gate.
- `UNIVERSE.md` — shared-reality canon bible (the frame, SPZ, transmission
  ledger §3, shared law §4, add-a-book §5).
- `docs/CATALOG.md` — every property + status + where it lives.
- `docs/OPERATIONS.md` — ops runbook (publish, audiobook, social, channels,
  asset-mcp, secrets).
- `docs/INFRASTRUCTURE.md` — GCP/Cloud Run/buckets/domains/asset-mcp.
- `docs/BRANCHES.md` — branch & worktree ledger + studio debt. CHECK THIS
  before assuming work is missing.
- `DNS.md` — all 16 Cloudflare zones, records, redirect rules.
- `.claude/commands/` — /studio-status, /new-book, /publish-book,
  /brand-check, /social-kit.

## Books (under `books/`)
- `digital-insurgency/` — COMPLETE + shipped (KDP/LinkedIn/Substack; build/
  artifacts). 2E (audio course + site) on branch
  `spz/digital-insurgency-2nd-edition-09052d`.
- `the-last-human-ceo/` — drafted (28 ch); audiobook Act 1 produced (rest on
  branch `spz/last-human-ceo-audiobook-7bb567`); podcast LIVE at
  lasthumanceo.com. REFERENCE IMPLEMENTATION for standards/ pipelines.
- `zero-trust-reality/` — ⚠ STALE byte-clone of the-last-human-ceo. Real book
  (*Defense Against the Dark Arts*, drafted, podcast LIVE) is on branch
  `spz/zero-trust-research-analysis-24ce8e`, unmerged.
- `neko-death-cult/` — 24-door scored audio drama + *Signal Finds Signal*
  album, fully produced. Bespoke audio-first format (no print pipeline);
  ~2.1 GB audio. Song tools in `tools/` (compose_songs.py, produce_song.py …).

Each standard book folder repeats the pipeline shape: foundation docs
(voice/world/characters/outline/canon.md), `chapters/`, Python tooling,
per-book README (book-specific) + PIPELINE.md/WORKFLOW.md.

## Studio infrastructure (root)
- `brand/spz/` — THE canonical SPZ brand kit: token JSONs (palette/typography/
  sonic/voices/verbal/…), `build_brand_kit.py` → `brand_kit.html`, and
  `ENFORCEMENT.md` (the pass/fail brand gate). Never fork.
- `standards/` — production playbooks: README (launch checklist), AUDIOBOOK,
  PUBLISHING, BRAND, SOCIAL.
- `publishing/` — book-agnostic podcast+site publisher (FastAPI on Cloud Run,
  GCS media, RSS): `config.json` (only per-book file), `deploy.sh`,
  `gen_feed.py`, `gen_site.py`, `make_cover.py`, `app/`.
- `asset-mcp/` — **studio main MCP endpoint**: Cloud Run FastMCP server,
  vector search over all assets (Firestore + Vertex multimodal embeddings +
  `gs://spz-assets`) + on-brand image generation (`generate_asset`).
  `config.json`, `ingest.py`, `deploy.sh`, `app/`. Built; deploy pending.
- `.env.example`, `pyproject.toml`, `uv.lock` — Python env (uv). Secrets in
  Google Secret Manager (project `stylelift`).
- `.wolf/` — OpenWolf context (see OPENWOLF.md protocol).

## Root legacy (frozen — do not work here)
The root still carries a byte-identical duplicate of Digital Insurgency's
full pipeline (manuscript.md, chapters/, ~27 *.py, linkedin/, substack/,
kdp/, landing/, build/, design/, typeset/, fonts/, PIPELINE.md, WORKFLOW.md,
CRAFT.md, ANTI-SLOP.md, ANTI-PATTERNS.md). `books/digital-insurgency/` is
canonical. `fonts/` at root is also the brand font source.

## Branches
Archives: `autonovel/{digital-insurgency,the-last-human-ceo,zero-trust-reality,
studio}` + `origin/autonovel/bells`. Active `spz/*` work branches + worktrees:
see `docs/BRANCHES.md` (the ledger). Main checkout `/Users/gregchambers/autonovel`
currently sits on the `autonovel/the-last-human-ceo` archive branch.
