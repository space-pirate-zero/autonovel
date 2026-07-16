# SPZ Asset MCP

A Cloud Run **MCP server** that indexes every asset you create — images, video,
animation, brand kits, copy, audio — into one organized, durable home and exposes
**vector-based multimodal search** over it. Ask for "the neon cel-shaded cover for
the cat book" or "all the LHCEO audiograms" from any MCP client and get back a
usable URL.

Built on the same stack as `publishing/`: GCS for media, scale-to-zero Cloud Run,
Secret Manager, project `stylelift`.

## How it works

```
 MCP client ──HTTP + Bearer──▶ Cloud Run (spz-asset-mcp, FastMCP)
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                 ▼
              Firestore        Vertex AI            GCS
          (assets + vector   (multimodal embed   (gs://spz-assets,
           index, native)     + Gemini caption)   organized by property)
```

**One shared embedding space.** `multimodalembedding@001` embeds images *and*
text into the same 1408-dim space, so images/video-keyframes (image embedding),
copy/brand-kits (text embedding of a Gemini summary), and your search query (text
embedding) all live together. A single Firestore `find_nearest` ranks across every
modality at once. Gemini auto-captions and tags each asset on ingest — that's what
lets you find an image by *describing* it.

**Canonical store.** Assets are copied to `gs://spz-assets/{property}/{type}/…`
(content-addressed by sha256, so re-ingest is a no-op). Objects already in another
bucket (e.g. `gs://spz-podcasts`) are indexed in place.

## Layout

| File | Role |
|---|---|
| `config.json` | The only file you edit: project/region/bucket/db, extension→type map, path→property map, backfill roots. |
| `app/enrich.py` | Type/property detection, Gemini caption+tags, Vertex embeddings, ffmpeg keyframes. Shared by server + CLI. |
| `app/store.py` | Firestore + GCS: schema, idempotent ingest core, vector search / list / get / find_similar. |
| `app/main.py` | FastMCP streamable-HTTP server + tools + bearer-token middleware. Listens on `$PORT`. |
| `ingest.py` | Backfill CLI (walks config roots + GCS buckets). |
| `create_index.sh` | Creates the Firestore DB + vector indexes. |
| `deploy.sh` | Idempotent one-shot deploy (mirrors `publishing/deploy.sh`). |
| `Dockerfile` | `python:3.12-slim` + ffmpeg. |

## MCP tools

- `search_assets(query, property?, type?, tag?, limit=10)` — semantic search.
- `list_assets(property?, type?, tag?, limit=25)` — browse/filter, no query.
- `list_properties()` — catalog overview (per-property / per-type counts).
- `get_asset(asset_id)` — full metadata incl. `public_url` and stored text.
- `find_similar(asset_id, limit=10)` — "more like this".
- `ingest_asset(source, property?, type?, force=false)` — add/refresh one asset
  (local path, `gs://` URI, or `http(s)://` URL).
- `generate_asset(topic, property?, style?, motif?, aspect_ratio?, art_direction?,
  reference_asset_ids?, count?, add_to_catalog=true)` — **generate a 100 % on-brand
  image** (SPZ house style) via Gemini and file it into the catalog, ready for
  socials. See below.
- `list_brand_styles()` — the available generation styles, motifs, and aspect presets.

## On-brand generation

`generate_asset` wraps every prompt in the Space Pirate Zero brand kit
(`brand/spz_style.json` — cyberpunk-noir; void `#030303` + hot-pink `#FF1493` +
signal-cyan `#00F0FF`; newsprint/VHS grit; "punch up, never down") so output is
on-brand **by construction**. Model: `gemini-2.5-flash-image` (Nano Banana) via
`GEMINI_API_KEY`.

- **Topical/real-time:** pass the current subject/headline as `topic`; the brand
  look is applied for you (e.g. `topic="our zero-trust guide drops today"`).
- **Motifs:** `spaceship`, `signal`, `portrait`, `tabloid` anchor recurring imagery.
- **Aspects:** `square` (1:1), `story`/`reel` (9:16), `portrait` (4:5),
  `landscape`/`wide` (16:9), `og` (1.91:1).
- **Consistency:** pass `reference_asset_ids` (catalog ids) to condition on an
  existing asset (e.g. the canonical SPZ character) for character/subject continuity.
- Each result is uploaded, captioned, embedded, and tagged with generation
  provenance (`origin=generated`, `gen_topic`, `gen_prompt`, `gen_model`, …), so a
  freshly generated social asset is immediately searchable alongside everything else.

Edit `brand/spz_style.json` to tune the house style (master prompt, palette, rules,
motifs, aspect presets) — it's baked into the container, no repo access needed.

`property` values: `the-last-human-ceo`, `neko-death-cult`, `digital-insurgency`,
`zero-trust-reality`, `brand-spz`, `publishing`, `misc`.
`type` values: `image`, `animation`, `video`, `vector`, `brand-kit`, `copy`,
`audio`, `doc`.

## Deploy

```bash
cd asset-mcp
bash deploy.sh            # enables APIs, makes bucket + Firestore + index, deploys
```

It prints the MCP endpoint (`…/mcp/`), the bearer token, and the exact
`claude mcp add` command. Vector indexes build in the background — search may be
empty for a few minutes after the first deploy.

## Backfill the library

```bash
# credentials for local runs (Vertex + Firestore + GCS via ADC):
gcloud auth application-default login

python ingest.py --dry-run --limit 20                 # preview classification only
python ingest.py --property the-last-human-ceo --type image --limit 5   # small real run
python ingest.py                                      # everything in config.backfill_roots
```

Idempotent — re-running skips unchanged files (content-addressed by sha256).

## Local dev

```bash
pip install -r requirements.txt   # or: uv pip install -e .
# no SPZ_ASSET_MCP_TOKEN => auth disabled (dev only)
python app/main.py                # serves on :8080, MCP at /mcp/
curl localhost:8080/healthz       # -> ok
```

## Cost

Everything scales to zero except Firestore (per read/write/GB — pennies at this
scale). Enrichment is a one-time Gemini + embedding charge per asset at ingest;
re-ingest is a sha256 no-op. `books/neko-death-cult/audio` (~2.1 GB) is indexed by
metadata only — no audio-content embedding — to keep ingest cheap.
