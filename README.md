# Spaceship Alpha 9 — Studio Repo

**This is the studio.** One repo that manages the books, the podcasts, the
album, the publishing pipelines, the socials, the marketing, the brand, and the
book-related experiences on the web — all shipped as transmissions from
**Spaceship Alpha 9**, narrated by **Space Pirate Zero**.

> *Signal finds signal.*

## Start here

| If you want to… | Read |
|---|---|
| Understand the studio + this repo | this file, then [docs/CATALOG.md](docs/CATALOG.md) |
| Understand the shared fictional canon | [UNIVERSE.md](UNIVERSE.md) |
| Write / produce / publish anything | [RULES.md](RULES.md) — the enforceable studio rules |
| Run a production pipeline | [standards/](standards/README.md) — audiobook, publishing, social, brand |
| Touch the brand | [brand/spz/](brand/spz/README.md) + [brand/spz/ENFORCEMENT.md](brand/spz/ENFORCEMENT.md) |
| Find or generate any asset | [asset-mcp/](asset-mcp/README.md) — the studio's main MCP endpoint |
| Know what's deployed where | [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) + [DNS.md](DNS.md) |
| Know what work lives on which branch | [docs/BRANCHES.md](docs/BRANCHES.md) |
| Run day-to-day ops (publish, socials, KDP) | [docs/OPERATIONS.md](docs/OPERATIONS.md) |
| Point an AI agent at this repo | [CLAUDE.md](CLAUDE.md) |

## What lives here

```
books/                      The catalog — each book self-contained with its own pipeline
  digital-insurgency/         COMPLETE + published (KDP, LinkedIn, Substack)
  the-last-human-ceo/         Drafted; audiobook + podcast LIVE (lasthumanceo.com)
  neko-death-cult/            24-door audio drama + 24-track album, fully produced
  zero-trust-reality/         ⚠ stale clone of TLHC — real book is on a branch (see docs/BRANCHES.md)
brand/spz/                  THE canonical SPZ brand kit (tokens + generator + brand_kit.html)
standards/                  The repeatable production playbooks (audiobook/publishing/social/brand)
publishing/                 Book-agnostic podcast + site publisher (GCS + Cloud Run + RSS)
asset-mcp/                  Studio MCP server — vector search + on-brand generation over ALL assets
docs/                       Studio documentation set (catalog, ops, infra, branches)
UNIVERSE.md                 Shared-reality canon bible (the frame, SPZ, the ledger, the law)
RULES.md                    Enforceable studio rules (brand, voice, publishing gates)
DNS.md                      All 16 Cloudflare zones + Cloud Run mappings
```

The repo root also still carries the original **autonovel pipeline** files for
*Digital Insurgency* (manuscript, chapters/, ~27 `*.py` tools, linkedin/,
substack/, kdp/, build/). These are a historical duplicate of
`books/digital-insurgency/` — the `books/` copy is canonical. New work never
happens at root.

## The catalog (one line each)

| Transmission | Form | Status |
|---|---|---|
| **Digital Insurgency** | Business × cyberpunk field manual | Complete; print/ebook built; KDP + 30-day LinkedIn + Substack shipped |
| **The Last Human CEO** | Literary tragicomedy (~114k words) | Drafted (28 ch); full-cast audiobook Act 1 done; podcast + site **LIVE** at [lasthumanceo.com](https://lasthumanceo.com) |
| **Defense Against the Dark Arts** (was *Zero Trust Reality*) | Nonfiction field course | Drafted + edited on branch `spz/zero-trust-research-analysis-24ce8e`; 14-ep audiobook **LIVE** as podcast |
| **The Maneki Neko Death Cult** | 24-door scored audio drama | All 24 doors + companion album produced |
| **Signal Finds Signal** | 24-track lofi-industrial-goth album | Produced (companion to Neko Death Cult) |

Full detail: [docs/CATALOG.md](docs/CATALOG.md).

## The production line

Every title moves through the same four playbooks (see [standards/](standards/README.md)):

1. **Write** — the autonovel pipeline (seed → foundation → drafts → revision →
   export). Full spec in [PIPELINE.md](PIPELINE.md); each book carries its own
   copy of the tooling.
2. **Audiobook** — manuscript → full-cast ElevenLabs audiobook
   ([standards/AUDIOBOOK.md](standards/AUDIOBOOK.md)).
3. **Publish** — audiobook → GCS + Cloud Run podcast site + RSS → Apple/Spotify
   + custom domain ([standards/PUBLISHING.md](standards/PUBLISHING.md), code in
   [publishing/](publishing/README.md)).
4. **Launch** — social kit: stills, audiograms, trailer, teasers, press kit,
   Substack drip ([standards/SOCIAL.md](standards/SOCIAL.md)).

All four consume the one brand: [brand/spz/](brand/spz/README.md). Never fork it.

## The studio endpoint

**[asset-mcp/](asset-mcp/README.md) is the studio's main MCP endpoint.** It is a
Cloud Run FastMCP server (`spz-asset-mcp`, project `stylelift`) that indexes
every asset in the studio — images, video, audio, brand kits, copy — into one
vector-searchable catalog (Firestore + Vertex multimodal embeddings + GCS
`gs://spz-assets`), and generates new 100%-on-brand images on demand
(`generate_asset`, Gemini, SPZ house style baked in). Connect any MCP client to
it and you can *find* ("the neon cover for the cat book") or *make* (on-brand
social art for today's headline) anything the studio owns.

**Status: DEPLOYED + LIVE** at `https://spz-asset-mcp-mzbi2syoxa-uc.a.run.app/mcp`
(no trailing slash), bearer-gated (`SPZ_ASSET_MCP_TOKEN` in Secret Manager).
Wire a client:
`claude mcp add --transport http spz-assets <URL>/mcp --header "Authorization: Bearer <token>"`.
Redeploy/refresh: `cd asset-mcp && bash deploy.sh` (idempotent).

## Quick start (writing pipeline)

```bash
git clone https://github.com/space-pirate-zero/autonovel.git && cd autonovel
cp .env.example .env        # or: bash load-secrets.sh (Google Secret Manager)
uv sync
cd books/<book>             # work inside a book, never at root
uv run python run_pipeline.py --help
```

API keys: `ANTHROPIC_API_KEY` (required), `ELEVENLABS_API_KEY` (audio),
`FAL_KEY`/`GEMINI_API_KEY` (art). Secrets live in Google Secret Manager
(project `stylelift`).

## Provenance

Forked from [karpathy/autoresearch](https://github.com/karpathy/autoresearch)'s
idea — the modify-evaluate-keep/discard loop applied to fiction. First novel
produced: *The Second Son of the House of Bells* (79,456 words, `autonovel/bells`
branch). The pipeline then became the studio.

**Spaceship Alpha 9, LLC** — Atlanta, GA. Greg Chambers (Space Pirate Zero,
Co-Founder & CTO) and Daniela Chambers (Co-Founder & CEO).
