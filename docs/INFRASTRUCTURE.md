# Studio Infrastructure — GCP, domains, endpoints

Everything runs in GCP project **`stylelift`**, region **`us-central1`**, on
scale-to-zero **Cloud Run** (podcast services pinned to `--min-instances 1`).
DNS is **Cloudflare** (16 zones, grey-cloud DNS-only to Google) — full record
detail in [../DNS.md](../DNS.md). Identity for gcloud/Search Console:
`zero@stylelift.fashion`; public contact `zero@spacepiratezero.com`.

> ⚠ `infra/sa9-sites/` GKE manifests (in the SA9 repo) are STALE. Production is
> Cloud Run, not GKE.

## Cloud Run services (this studio's slice)

| Service | What | Domain |
|---|---|---|
| `spz-asset-mcp` | **Studio main MCP endpoint** — asset vector search + on-brand generation ([asset-mcp/](../asset-mcp/README.md)) | LIVE: `spz-asset-mcp-mzbi2syoxa-uc.a.run.app/mcp` (bearer-gated) |
| `spz-podcast-lhceo` | The Last Human CEO podcast + site | lasthumanceo.com |
| `spz-podcast-defense` | Defense Against the Dark Arts podcast | `*.run.app` feed (no custom domain yet) |
| `sa9-website` | SA9 marketing site | spaceshipalpha9.co, spaceship-alpha-9.com |
| `spz` | SPZ personal site | spacepiratezero.com |
| `danielachambers` | Daniela Chambers site | danielachambers.com |
| Digital Insurgency 2E site | interactive course site (branch work) | `digital-insurgency-373293565001.us-central1.run.app` |

(Other `stylelift` services — `darkwave-web`, `ghostdeck-web`, `countryplus`,
`stylelift-*`, `tradecraft`, `sa9-marketing-mcp`, `contact-card` — belong to
the wider SA9 product portfolio; see DNS.md.)

## Storage

| Bucket | Contents |
|---|---|
| `gs://spz-podcasts/<book>/` | produced episode mp3s, covers, episode art, social video (public-read) |
| `gs://spz-assets/{property}/{type}/…` | the asset-mcp canonical store, content-addressed by sha256 (private; served via signed/public URLs per config) |

Rule: big media never lives in git or in an app container (RULES.md §6.1).

## Asset MCP (the studio endpoint)

- Stack: FastMCP streamable-HTTP on Cloud Run + Firestore native vector index
  (db `spz-assets`, collection `assets`) + Vertex `multimodalembedding@001`
  (1408-dim shared image/text space) + Gemini captioning
  (`gemini-2.5-flash-lite`) + Gemini image gen (`gemini-2.5-flash-image`).
- Auth: bearer token (`SPZ_ASSET_MCP_TOKEN`, Secret Manager).
- Deploy: `cd asset-mcp && bash deploy.sh` (idempotent: APIs, bucket,
  Firestore, indexes, service; prints the `claude mcp add` command).
- Backfill: `python ingest.py` (walks `config.json` backfill roots + GCS
  buckets; sha256 no-op on re-run).
- Status 2026-07-15: **DEPLOYED + LIVE** — endpoint
  `https://spz-asset-mcp-mzbi2syoxa-uc.a.run.app/mcp` (**no trailing slash**;
  `/mcp/` 307-redirects and downgrades to http). `--allow-unauthenticated` at
  Cloud Run + app-layer bearer (missing/bad token → 401). Verified:
  initialize + tools/list return all 8 tools. Known cosmetic issue: `/healthz`
  404s on the deployed container. Gemini caption model must be
  `gemini-2.5-flash-lite` (other aliases 404/empty in us-central1).
  Backfill of the zero-trust worktree (1192 assets / 3.86 GB) still pending.

## Domains (studio-relevant zones)

| Domain | Purpose |
|---|---|
| lasthumanceo.com | TLHC podcast site (live) |
| spacepiratezero.com | SPZ site (live) |
| spaceshipalpha9.co / spaceship-alpha-9.com | SA9 site (live) |
| signalfindssignal.com | album domain (parked, awaiting release) |
| digital-insurgency.com | email-only (KDP/marketing) |
| danielachambers.com | live (+ .org/.xyz redirects pending NS) |

Full table of all 16 zones, records, and redirect rules: [../DNS.md](../DNS.md).

## Secrets

Google Secret Manager, project `stylelift`. `load-secrets.sh` at repo root (on
the main checkout) regenerates `.env`. Never in git: `.env`, Apple `.p8`/`.pem`
podcast keys, MCP bearer tokens, `X_*` credentials.
