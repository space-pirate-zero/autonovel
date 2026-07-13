# Spaceship Alpha 9 — Production Standards

The repeatable playbook for taking **any** book in this monorepo from finished
manuscript → full-cast audiobook → published podcast + marketing site → social
launch kit. *The Last Human CEO* (`books/the-last-human-ceo/`) is the **reference
implementation**: everything here was proven there first. To launch a new title,
copy its tooling, swap the inputs, and follow these docs.

All output must sit inside one universe (**Spaceship Alpha 9**) and one brand
(**SPZ**). See [`../UNIVERSE.md`](../UNIVERSE.md) for canon and [`BRAND.md`](BRAND.md)
for the visual/sonic system every generator must obey.

## The four pipelines

| Stage | Doc | Reference code | Output |
|---|---|---|---|
| 1. Audiobook | [`AUDIOBOOK.md`](AUDIOBOOK.md) | `books/<book>/*.py`, `audiobook/PRODUCTION_SPEC.md` | `audiobook/produced/ch_NN_PRODUCED.mp3` (theme + host-intro + full cast) |
| 2. Publishing | [`PUBLISHING.md`](PUBLISHING.md) | `publishing/` | Public GCS audio + RSS + Cloud Run site, live on Apple & Spotify |
| 3. Social kit | [`SOCIAL.md`](SOCIAL.md) | `books/<book>/social/` | ~70 images + trailer + audiograms + 29 teasers + press kit + copy |
| 4. Brand | [`BRAND.md`](BRAND.md) | `brand/spz/`, `fonts/` | The tokens (color, type, voice, sonic) the other three consume |

## Launch checklist for a new book

Assumes the manuscript is finished under `books/<book>/chapters/` (`ch_NN.md`,
one `# Chapter N — Title` heading per file, plus `ch_coda.md`).

1. **Audiobook** — port the six generators + `PRODUCTION_SPEC.md` from the
   reference book, retarget `audiobook_voices.json` to the new cast (SPZ brand
   voice IDs only), then run the act scripts. → [`AUDIOBOOK.md`](AUDIOBOOK.md)
2. **Art** — `gen_episode_art.py` (Gemini anime, no baked text), then
   `embed_episode_art.py` to embed ID3 covers. Re-do the podcast cover in the
   same style. → [`AUDIOBOOK.md`](AUDIOBOOK.md#episode-art) + [`BRAND.md`](BRAND.md)
3. **Publish** — write `publishing/config.json` for the new show (own GCS prefix
   + Cloud Run service + `public_url` domain), then `deploy.sh`. Submit the feed
   to Apple & Spotify; map the custom domain. → [`PUBLISHING.md`](PUBLISHING.md)
4. **Social** — `gen_hooks.py` → `gen_images.py all` → `gen_video.py` →
   `gen_trailer.py` → `gen_teasers.py` → `make_presskit.sh`. Fill `COPY.md` /
   `PRESS.md`. → [`SOCIAL.md`](SOCIAL.md)
5. **Canon** — register the book in [`../UNIVERSE.md`](../UNIVERSE.md) as a new
   *transmission*: its logline, its SPZ connection point, and any shared motifs
   or cameos.

## Non-negotiables (apply to every stage)

- **One brand, no forks.** Colors, fonts, voice, tagline come from `brand/spz/`.
  Never invent a variant palette or a second logotype. [`BRAND.md`](BRAND.md).
- **SPZ narrates.** Every audiobook opens with the theme + a Space-Pirate-Zero
  host-intro; every launch is "a Space Pirate Zero transmission." Voice is
  snarky, punk, cinematic, a little heartbroken.
- **Pipelines are resume-safe.** Renders skip existing outputs; long jobs run
  detached (`nohup`/background) so a session teardown can't kill them. Fail fast
  on quota/billing errors, never silently.
- **ffmpeg here has no `drawtext`.** All text on images/video is baked with
  Pillow using the brand fonts, then composited. Don't reach for `drawtext`.
- **Costs are real.** Audio (ElevenLabs) and image (Gemini) generation bill per
  call. Confirm before regenerating a whole book. Cloud Run runs `--min-instances 1`
  during a launch; drop to 0 to idle a title cheaply.
- **Log the recipe.** When a stage's settings are approved, freeze them in that
  book's `audiobook/PRODUCTION_SPEC.md` so re-renders are reproducible.
