# Digital Insurgency — Podcast (Setup)

Standalone show on the Space Pirate Zero network, same pipeline as
*The Last Human CEO*: produced MP3s live in **public GCS**, a tiny **Cloud Run**
service serves the **RSS feed** + landing page, you submit the feed URL once to
Apple + Spotify.

```
episode scripts ──► (record: ElevenLabs v3) ──► produced mp3s ──► GCS (public)
                                                     ▲                 ▲
                                                     │        enclosure URLs
                                          publishing/gen_feed.py builds feed.xml
                                                     ▼
                                            Cloud Run (FastAPI) ─► GET /feed.xml
                                                                  GET /  landing
```

> **STATUS: pre-recording. No audio exists yet.** `audiobook/produced/` is empty
> on purpose. Do **not** run the deploy until episodes are recorded and greenlit.
> This directory is the setup; recording is the next gate.

## What's set up now (no audio)
- `config.json` — show metadata + GCP target + the 14-episode list. This is the
  standalone-show config; paths are relative to the repo root.
- `episodes.md` — the 14-episode field-course map (modules, sources, physics,
  beats, field assignments, runtime targets).
- `../audiobook/` — the recording scaffolding: `scripts/` (per-episode recording
  scripts), `intros/` (per-episode show notes, read by `gen_feed.py`), `produced/`
  (empty), `README.md` (cast + delivery-tag guide), `audiobook_voices.json`
  (voice casting).

## How this publishes (when audio is ready)

The shared pipeline lives at the **repo root** in `publishing/` and reads a single
`publishing/config.json`. To publish *this* show without disturbing the LHCEO
config:

```bash
# from repo root — point the pipeline at Digital Insurgency
cp books/digital-insurgency/podcast/config.json publishing/config.json
./publishing/deploy.sh
```

`deploy.sh` will: create/verify `gs://spz-podcasts`, make it public-read, build
the square cover, upload cover + episode MP3s, generate `feed.xml`, and deploy the
Cloud Run service **`spz-podcast-insurgency`**. It prints the feed URL to submit.

### One pipeline generalization needed before first deploy (tracked, not done)
`publishing/deploy.sh` currently has two **LHCEO-specific** lines to generalize:
1. the produced-audio glob `"$PRODUCED"/ch_*_PRODUCED.mp3` — DI episodes will be
   named `ep_NN_PRODUCED.mp3`, so the glob must come from config or match `ep_*`.
2. the hardcoded `VID="books/the-last-human-ceo/social/video"` block — should read
   from config or be skipped when absent.

And one in `publishing/gen_feed.py`:
3. `episode_notes()` reads show notes from `intros_dir/ch{NN}.txt`, and the produced
   glob is `ch_*_PRODUCED.mp3`. Our intros are `intros/ep_NN.md` and audio will be
   `ep_NN_PRODUCED.mp3` (consistent with the scripts). At the gate, adapt the loader
   to `ep_{NN}.md` / `ep_*_PRODUCED.mp3` (or add a config-driven episode-stem). Keep
   the `ep_` naming — don't rename our files back to `ch`.

None of these block setup; all three are flagged here so the first DI deploy is
clean. Do them at the recording gate, not now.

## Recording gate (the deferred step)
1. Lock all 14 scripts in `../audiobook/scripts/` (Ep 01 is the reference).
2. Render each to `../audiobook/produced/ep_NN_PRODUCED.mp3` (ElevenLabs v3;
   cast + tags in `../audiobook/README.md`). **← this is the "no audio yet" line.**
3. Generalize the two deploy.sh lines above.
4. `cp` the config, run `./publishing/deploy.sh`, submit the feed URL.

## Submit (manual, once, needs your logins)
- **Apple** → <https://podcastsconnect.apple.com> → New Show → Add with RSS feed →
  paste the feed URL. The `<itunes:owner>` email (`zero@spacepiratezero.com`) must
  receive the verification.
- **Spotify** → <https://podcasters.spotify.com> → Add your podcast → paste the
  feed URL → verify via the emailed code.

## Domain
`config.json` sets `public_url` to the canonical domain **`https://digital-insurgency.com`**
(site + podcast landing). Register it and point DNS at the Cloud Run service before
promoting the show.
