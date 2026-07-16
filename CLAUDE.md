# CLAUDE.md — AI context for the Spaceship Alpha 9 studio repo

This repo IS the studio: books, podcasts, album, publishing, socials,
marketing, brand, and web experiences for **Spaceship Alpha 9** /
**Space Pirate Zero**. Treat every task here as studio work.

## Read order (every session)

1. `.wolf/OPENWOLF.md` — session protocol (anatomy → cerebrum → buglog → work → log).
2. `.wolf/anatomy.md` — the repo map. Check it before opening project files.
3. `RULES.md` — the enforceable studio rules. **All creative and publishing
   output must comply.**
4. Task-specific: `UNIVERSE.md` (writing), `standards/` (producing),
   `brand/spz/ENFORCEMENT.md` (any visual/audio/copy output),
   `docs/` (catalog / ops / infra / branches).

## Ground truth (do not re-derive)

- **Monorepo:** every book is self-contained under `books/<name>/` with its own
  pipeline copy. The root-level book files (manuscript.md, chapters/, *.py) are
  a historical duplicate of `books/digital-insurgency/` — never work at root.
- **`books/zero-trust-reality/` on master is a stale byte-identical clone of
  `the-last-human-ceo`.** The real book (renamed *Defense Against the Dark
  Arts*) lives on branch `spz/zero-trust-research-analysis-24ce8e`.
- **Live work sits on `spz/*` branches** in `.claude/worktrees/` — see
  `docs/BRANCHES.md` before assuming something is missing or starting it fresh.
- **Brand:** `brand/spz/` is THE canonical kit. Edit `build_brand_kit.py`,
  never fork variants. Tokens: void `#030303`, pink `#FF1493`, cyan `#00F0FF`,
  paper `#E8E8E8`, muted `#8A90A0`; Orbitron / Space Grotesk / JetBrains Mono;
  ~70 BPM industrial-goth, −16 LUFS; SPZ hero voice `8bOIcU4hJx9LYJV4NS1I`
  (`eleven_v3`).
- **Infra:** GCP project `stylelift`, region `us-central1`. Podcasts on Cloud
  Run + `gs://spz-podcasts`. Assets on `gs://spz-assets` via `asset-mcp/`
  (service `spz-asset-mcp`) — **the studio's main MCP endpoint** for finding
  and generating assets. Domains: Cloudflare, see `DNS.md`. Secrets: Google
  Secret Manager (`load-secrets.sh` regenerates `.env`).
- **Voice:** Space Pirate Zero — snarky, punk, active voice only, punch up
  never down. Banned corporate words listed in `RULES.md` §Voice.

## Shortcuts

Slash commands in `.claude/commands/`:
`/studio-status`, `/new-book`, `/publish-book`, `/brand-check`, `/social-kit`.

## Non-negotiables

- Follow `.wolf/OPENWOLF.md` logging duties (anatomy/memory/cerebrum/buglog).
- Never regenerate a hand-authored foundation (`run_pipeline --from-scratch`
  overwrites it). Start at drafting or revision.
- Never commit secrets (`.env`, Apple `.p8`/`.pem`), `.venv/`, or multi-GB
  audio that belongs in GCS.
- Every public artifact passes `brand/spz/ENFORCEMENT.md` before shipping.
