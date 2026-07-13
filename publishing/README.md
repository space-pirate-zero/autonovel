# SPZ Podcast Publishing

Publishes the produced audiobook as a podcast Apple Podcasts and Spotify can
subscribe to. Audio lives in **public GCS**; a tiny **Cloud Run** service serves
the **RSS feed** + a landing page. You submit the feed URL once to each platform.

```
produced mp3s ──► GCS bucket (public)  ◄── enclosure URLs in the feed
                       ▲
publishing/gen_feed.py │ builds feed.xml
                       ▼
                 Cloud Run (FastAPI)  ──►  GET /feed.xml   ← submit this to Apple + Spotify
                                          GET /            landing page
```

## Layout
- `config.json` — show metadata + GCP target (edit here). Currently: *The Last Human CEO*,
  explicit, Fiction, serial, all 29 episodes live at launch, project `stylelift`.
- `gen_feed.py` — builds `app/feed.xml` from the produced mp3s (durations, byte sizes,
  per-episode show notes from the chapter host-intros).
- `make_cover.py` — 3000×3000 square podcast cover from the portrait book cover.
- `app/` — the Cloud Run service (`main.py`, `Dockerfile`, `requirements.txt`).
- `deploy.sh` — one command: bucket + upload + feed + deploy.

## Prerequisites (one-time)
- `gcloud` authed (`gcloud auth login`) and the `stylelift` project **billing-enabled**.
- The project must allow **public GCS objects** (no `storage.publicAccessPrevention`
  org policy). If public buckets are blocked, we need the CDN/signed-URL variant instead.
- `ffmpeg` + `python3` locally (used to size the audio and build the cover/feed).

## Deploy
```bash
./publishing/deploy.sh
```
It enables the needed APIs, creates `gs://spz-podcasts`, makes it public-read, uploads the
cover + 29 episodes, generates the feed, and deploys the Cloud Run service. It prints:
```
Landing page : https://spz-podcast-lhceo-XXXX.us-central1.run.app
FEED URL     : https://spz-podcast-lhceo-XXXX.us-central1.run.app/feed.xml
```
Re-run any time to push changes (new episodes, edited metadata) — it's idempotent.

## Submit to the platforms (manual, once — needs your logins)
**Apple Podcasts** → <https://podcastsconnect.apple.com> → **+ → New Show → Add a show with an
RSS feed** → paste the **FEED URL** → validate → submit. Apple emails when approved
(usually hours–a few days). The `<itunes:owner><itunes:email>` in the feed
(`zero@spacepiratezero.com`) must be one you can receive verification at.

**Spotify** → <https://podcasters.spotify.com> → **Add your podcast** → paste the **FEED URL**
→ verify via the code Spotify emails to that same owner address → confirm details → publish.
Spotify usually lists within hours.

Both platforms then poll the feed periodically; new episodes appear automatically on redeploy.

## Notes
- **All 29 live at launch:** feed is `<itunes:type>serial</itunes:type>` with back-dated
  `pubDate`s so players order 1→29 and everything is immediately available. To switch to a
  weekly/twice-weekly drip later, change `schedule.mode` handling in `gen_feed.py`.
- **Validate** the feed before submitting: <https://podba.se/validate/> or
  <https://castfeedvalidator.com> (paste the FEED URL).
- **Custom domain** (e.g. `feed.spacepiratezero.com`) is optional — map it to the Cloud Run
  service in the Cloud Run console, then re-run with that as `--self-url`.
- **Cost:** Cloud Run idles to zero (feed is tiny); the real cost is GCS egress on the ~3.2 GB
  of audio as listeners download episodes.
