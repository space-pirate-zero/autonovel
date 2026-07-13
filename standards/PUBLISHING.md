# Standard: Podcast + Site Publishing

How a finished audiobook becomes a public podcast (Apple + Spotify) and a
marketing site, hosted on Google Cloud Run with a custom domain and real SEO.
Reference implementation: `publishing/` (currently wired for *The Last Human CEO*;
it is **config-driven**, so a new book is mostly a new `config.json`).

## Architecture

- **Audio + art → public GCS.** The mp3s, cover, and per-episode art live in a
  public-read bucket (`gs://spz-podcasts/<prefix>/…`). Big files are never served
  by the app.
- **RSS + site → Cloud Run.** A small FastAPI service serves the feed, the
  marketing pages, sitemap, and robots. Everything it serves is baked into the
  container at deploy time.
- **Custom domain → the app.** DNS (Cloudflare) points the domain at the Cloud
  Run service; the marketing site canonicalises to that domain for SEO.

## The tools

| File | Role |
|---|---|
| `config.json` | The **only** per-book file that must change. Show metadata, `gcp` (project/region/bucket/prefix/service), `public_url` (custom domain, the SEO canonical), and `source` paths (produced dir, cover master, episode art dir). |
| `gen_feed.py` | Builds the iTunes RSS: `serial` type, per-episode `itunes:image`, `<enclosure length>` read from the **actual file size**. `--self-url` sets the feed's own URL (what Apple/Spotify ingest). |
| `gen_site.py` | Server-renders `index.html` (click-to-play with a Web-Audio waveform, minimise-to-play), `about.html`, `press.html`, `sitemap.xml`, `robots.txt`. Canonical/OG/JSON-LD all use `public_url`. Favicon + press cover point at the **GCS cover URL** (`COVER_URL`), never the site root. |
| `make_cover.py` | Renders the square podcast cover from the master art. |
| `app/main.py` | FastAPI. Routes serve the baked files. `/feed.xml` **must accept HEAD** (`api_route` GET+HEAD) — Apple's iTMS crawler HEADs the feed. `/cover.jpg` 302-redirects to the GCS cover so the pretty URL resolves. |
| `app/Dockerfile` | Copies the baked `*.html`, `feed.xml`, `sitemap.xml`, `robots.txt`, `static/` into the image. |
| `deploy.sh` | Idempotent 2-pass deploy (below). |

## Deploy

```bash
cd publishing
bash deploy.sh
```

What it does (all in the `gcp.project`, billed to you):
1. Ensure the bucket exists + public-read; build the cover; upload cover + all
   `ch_*_PRODUCED.mp3` + per-episode art to GCS.
2. **Pass 1** — build feed + site, deploy to learn the service URL.
3. **Pass 2** — rebuild the feed with its real self-URL and the site canonicalised
   to `public_url` (the custom domain), redeploy. Runs `--min-instances 1`.

> `deploy.sh` re-uploads audio with `gcloud storage cp`; for an **app-only** change
> (HTML or `main.py`) skip that cost and deploy the container directly:
> `gcloud run deploy <service> --source app --region <region> --allow-unauthenticated …`

## Submitting to the directories

- **Apple Podcasts Connect** and **Spotify for Podcasters** both ingest the **RSS
  URL** — there is no API upload. Submit `https://<service-or-domain>/feed.xml`.
- Apple failures are almost always the feed: a stale served feed whose
  `<enclosure length>` doesn't match the GCS file, or a `405` on HEAD. Diagnose
  via Cloud Run logs (look for the `iTMS` user-agent). Fix, redeploy, refresh.
- **Never** put an Apple `.p8`/`.pem` key into the repo or chat — the feed is all
  that's needed. If one is exposed, treat it as compromised and rotate it.

## Custom domain (Cloudflare → Cloud Run)

1. Add the Cloud Run **domain mapping** for `public_url`; it needs Search-Console
   verification (add the `google-site-verification` TXT record).
2. Point DNS at the service. During cert provisioning keep records **DNS-only**
   (grey cloud), not proxied.
3. The bucket needs **CORS** enabled so the site's Web-Audio waveform can read the
   audio cross-origin.

## SEO checklist

- Canonical, `og:url`, JSON-LD, and sitemap all use `public_url` — **not** the
  `run.app` host (duplicate-host penalty). Set `show.public_url` in `config.json`.
- `PodcastSeries` + `PodcastEpisode` JSON-LD, per-episode OG, sitemap + robots
  with the sitemap URL. All emitted by `gen_site.py`.
