# Studio Catalog — every property, status, and where it lives

The transmission ledger with production detail. Canon frame: [UNIVERSE.md](../UNIVERSE.md).
Updated: 2026-07-15.

---

## Digital Insurgency
*A Field Manual for Smuggling Authenticity Past the Corporate Immune System*

- **Form:** business strategy × cyberpunk graphic novel × spec-ops field manual.
- **Status:** ✅ COMPLETE (16/16 chapters, novel score 8.0) and shipped.
- **Where:** `books/digital-insurgency/` (canonical). The repo root carries a
  byte-identical historical duplicate — ignore it.
- **Built:** PDF, ePub, Kindle, 6×9 paperback + cover (`build/`), designed PDF.
- **Marketing shipped:** Amazon KDP (`kdp/`), 30-day LinkedIn campaign — posts
  live, ids in `linkedin_slugs.json`; Substack serialization (~24 posts +
  cards + fables, `substack/`); landing page (`landing/`).
- **2nd Edition ("The Recording Edition") — MERGED + LIVE:** 14-episode audio
  field course (`podcast/`, show `spz-podcast-insurgency`) + interactive
  course site (`website/`, Next.js, LIVE at
  `digital-insurgency-373293565001.us-central1.run.app`; custom domain
  pending) + `art/spaceships/` (the canonical vessel renders, UNIVERSE.md
  §1a). Charter: `2ND_EDITION.md`. Remaining: GHOST, Boss-Fight sim,
  Open Badge, full 14-ep render.

## The Last Human CEO

- **Form:** literary near-future tragicomedy (~114k words, 28 chapters + coda).
  Comp: *Succession* meets *Klara and the Sun*.
- **Status:** ✅ drafted; 🎧 full-cast audiobook Act 1 (slots 0–9) produced;
  slots 10–29 pending greenlight (branch `spz/last-human-ceo-audiobook-7bb567`).
- **Where:** `books/the-last-human-ceo/` — the **reference implementation** for
  all four `standards/` pipelines. Richest doc set (SYNOPSIS_FULL,
  PUBLISHER_PITCH, EDITOR_SUMMARY, REVISION_MAP, STYLE).
- **Live:** podcast + site at **https://lasthumanceo.com** (Cloud Run
  `spz-podcast-lhceo`, bucket `gs://spz-podcasts/the-last-human-ceo`).
  Apple id6790448408 · Spotify 033OSpl5KjvWx07upDLZ8M. 29 episodes ≈ 12.6 h.
- **Marketing:** social kit (32 videos + ~70 stills per SOCIAL.md), Facebook
  daily-drip kit (`fb/`), Substack drip, press kit.

## Defense Against the Dark Arts (was *Zero Trust Reality*)

- **Form:** nonfiction field course, 13 modules (~57k words) + front/back matter.
- **Status:** ✅ drafted + edited; 🎧 14-episode audiobook rendered, produced,
  and **published LIVE** as a podcast (Cloud Run `spz-podcast-defense`, feed
  `spz-podcast-defense-mzbi2syoxa-uc.a.run.app/feed.xml`).
- **Where:** ⚠ **branch `spz/zero-trust-research-analysis-24ce8e`** (worktree
  `zero-trust-research-analysis-24ce8e`) — NOT yet merged to master.
  `books/zero-trust-reality/` on master is a **stale byte-identical clone of
  The Last Human CEO** left over from the monorepo consolidation; treat it as a
  placeholder until the Defense content is merged in over it.

## The Maneki Neko Death Cult

- **Form:** "Advent Calendar of Death" — 24 Twilight-Zone doors (one per
  cocktail / dead-artist saint) as a scored audio drama (~10.5 h). SPZ is the
  protagonist (time-slipper), not just narrator.
- **Status:** ✅ all 24 doors produced (voice + score + mixed mp3s);
  companion album produced.
- **Where:** `books/neko-death-cult/` — bespoke format, no print pipeline.
  Design docs: `format.md`, `audio.md`, `scoring.md`, `album.md`, `physics.md`.
  Tools: `tools/` (compose_songs, produce_song, mix, record, assemble).
  ~2.1 GB audio under `audio/` (indexed metadata-only in asset-mcp).

## Signal Finds Signal (album)

- **Form:** 24-track lofi-industrial-goth companion album (one track per door).
- **Status:** ✅ produced; lyrics 4–24 rewrite restored on master (1754e5d);
  release prep on `album-release-tmp` branch. Domain `signalfindssignal.com`
  registered (parked).
- **Where:** `books/neko-death-cult/audio/{album,songs,produced}/` +
  `suno_parts/` (per-track Suno lyrics/style).

## The Second Son of the House of Bells (legacy)

- First novel ever produced by the pipeline (79,456 words, 19 chapters).
  Archived on `origin/autonovel/bells`; intentionally not in the monorepo.

---

## Adjacent studio properties (other repos / branches)

| Property | Where |
|---|---|
| SA9 + SPZ marketing sites | **now in this repo at `web/`** (PR #7): `web/sa9-website/` = spaceshipalpha9.co, `web/spz-site/` = spacepiratezero.com; Phase 2 workspace wiring pending (`web/STUDIO-MIGRATION-PLAN.md`) |
| X channel @spaceshipalpha9 | `x/` on master (Tweepy client + CLI; see `x/PROFILE.md`) |
| Asset MCP (studio endpoint) | `asset-mcp/` — on this branch, see [../asset-mcp/README.md](../asset-mcp/README.md) |
| Six released music albums | catalog in `brand/spz/catalog.json` |
