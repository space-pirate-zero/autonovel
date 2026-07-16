# Studio Operations — publish, promote, repeat

Day-to-day ops runbook. The deep playbooks live in [../standards/](../standards/README.md);
this file is the map of *what we operate* and the commands that touch production.
Rules that gate all of this: [../RULES.md](../RULES.md).

---

## 1. Publish a book as a podcast + site

Playbook: [standards/PUBLISHING.md](../standards/PUBLISHING.md) · Code: [publishing/](../publishing/README.md)

```bash
cd publishing
# 1. edit config.json (the ONLY per-book file): show metadata, gcp block, public_url
# 2. deploy end-to-end (idempotent, 2-pass):
bash deploy.sh
# 3. paste the printed feed URL into Apple Podcasts Connect + Spotify for Podcasters (manual)
# 4. map the custom domain in Cloud Run + Cloudflare, record it in DNS.md
```

Currently in production:

| Show | Service | Feed / site |
|---|---|---|
| The Last Human CEO | `spz-podcast-lhceo` | https://lasthumanceo.com (Apple id6790448408, Spotify 033OSpl5KjvWx07upDLZ8M) |
| Defense Against the Dark Arts | `spz-podcast-defense` | `spz-podcast-defense-mzbi2syoxa-uc.a.run.app/feed.xml` |

Gotchas already paid for (see `.wolf/buglog.json`): feed must answer **HEAD**
(Apple crawler); keep `--min-instances 1`; `<enclosure length>` = real byte
size; canonical/OG/JSON-LD use `public_url`, never `run.app`.

## 2. Produce an audiobook

Playbook: [standards/AUDIOBOOK.md](../standards/AUDIOBOOK.md) · Reference: `books/the-last-human-ceo/`

Order: `gen_audiobook_script.py` → `gen_theme.py` → `gen_chapter_intros.py` →
`render_audiobook.py` → `produce_chapter.py`, run detached via
`run_act1.sh` / `run_act2.sh` / `finish_book.sh`. Voices only from
`brand/spz/voices.json`; approved settings frozen in the book's
`audiobook/PRODUCTION_SPEC.md`.

## 3. Ship the social launch kit

Playbook: [standards/SOCIAL.md](../standards/SOCIAL.md)

`gen_hooks.py` → `gen_images.py all` (~70 stills) → `gen_video.py` (audiograms)
→ `gen_trailer.py` → `gen_teasers.py` (29 Reels) → `make_presskit.sh` (zip →
GCS). Waveforms cyan→pink (`0x00F0FF|0xFF1493`); kicker "A SPACE PIRATE ZERO
TRANSMISSION"; all text baked with Pillow (no ffmpeg drawtext here).

## 4. Channels

| Channel | Where | How |
|---|---|---|
| **LinkedIn** | root `linkedin/` (Digital Insurgency 30-day campaign) | `build_li.py`; published ids in `linkedin_slugs.json` |
| **Substack** | per-book `substack/` | `build_posts.py` / `gen_posts.py`, `push_substack.py` / `push_and_schedule.py`, weekday drip |
| **X @spaceshipalpha9** | `x/` (on master) | `xcli.py` (Tweepy v2, `X_*` creds in `.env`; all writes support `--dry-run`); Free tier writes but can't read timelines |
| **Facebook** | `books/the-last-human-ceo/fb/` | daily-drip kit (schedule + posts) |
| **Amazon KDP** | per-book `kdp/` | `KDP_UPLOAD.md` + metadata; watch 6×9 gutter/margin specs (past rejection logged) |
| **Press** | `publishing/` press page + `make_presskit.sh` | press kit zip on GCS, git-ignored |

## 5. Assets — find and generate (asset-mcp)

[asset-mcp/](../asset-mcp/README.md) is the **studio's main MCP endpoint**.

- **Find:** `search_assets` / `list_assets` / `find_similar` over every studio
  asset (vector search across images, video, audio, copy, kits).
- **Generate:** `generate_asset(topic, …)` produces on-brand social images by
  construction (SPZ house style wrapped around every prompt) and files them
  into the catalog automatically.
- **Maintain:** new finished assets get ingested (`ingest_asset` or
  `python ingest.py` backfill). Deploy/refresh: `cd asset-mcp && bash deploy.sh`.
  Current ingest gaps (TLHC = 0 assets!) tracked in
  [BRANCHES.md](BRANCHES.md) §Asset-MCP ingest gaps.
- **Vessel canon:** any generated image containing the ship must condition on
  the canonical `brand-spz` renders via `reference_asset_ids` (RULES.md §3.5).
  Note: `asset-mcp/brand/spz_style.json` is baked into the container — the
  motif update of 2026-07-15 needs a `deploy.sh` redeploy to reach the live
  endpoint.

## 6. Secrets & credentials

All secrets in **Google Secret Manager** (project `stylelift`);
`load-secrets.sh` regenerates `.env`. Keys in use: `ANTHROPIC_API_KEY`,
`ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, `FAL_KEY`, `X_*` (Twitter),
`SPZ_ASSET_MCP_TOKEN`. Never commit any of them; never commit Apple `.p8`/`.pem`.

## 7. Session protocol (AI + human)

Every working session follows [.wolf/OPENWOLF.md](../.wolf/OPENWOLF.md):
check `anatomy.md` (map) and `cerebrum.md` (do-not-repeat) first, log bugs to
`buglog.json`, append the session to `memory.md`, keep `anatomy.md` current.
