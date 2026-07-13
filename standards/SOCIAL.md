# Standard: Social Launch Kit

The full marketing asset set for a launch: images, motion video, per-episode
teasers, a downloadable press kit, and ready-to-post copy. Reference
implementation: `books/the-last-human-ceo/social/`. Everything is SPZ-branded
(see [`BRAND.md`](BRAND.md)) and generated from the book's own art + audio + hooks.

## The tools

| Script | Output |
|---|---|
| `gen_hooks.py` | One Opus call → `hooks.json` (one ≤1-line hook per chapter) + `quotes.json` (standalone lines). Everything else reads these. |
| `gen_images.py` | `launch` (square/story/x-card/now-streaming/quote), `episodes` (29 full-bleed cards), `episodes_v` (29 vertical 9:16), `quotes` (8). `all` = launch + episodes + quotes. |
| `gen_video.py` | Audiograms: `audiogram_square.mp4` (1080²) + `_vertical.mp4` (1080×1920). Reactive waveform + animated title/NOW STREAMING/link with a **glow-pulse** CTA. |
| `gen_trailer.py` | `trailer.mp4` (~49s): **title-reveal intro** over scene 1 → crossfading art montage + animated lower-third → **glow-pulse end card**. |
| `gen_teasers.py` | `teasers/teaser_epNN.mp4` — one vertical ~11s Reel **per chapter**: episode art with a Ken-Burns push, EP number, chapter title, its hook, waveform, glow-pulse CTA, under that chapter's own audio. Resumable. |
| `make_presskit.sh` | Zips cover + all graphics + all video + `PRESS.md` + `COPY.md` and uploads to `gs://…/press-kit.zip` (linked from the site's `/press`). |
| `COPY.md` / `PRESS.md` | The copy pack (taglines, platform posts, teasers, email pitch, hashtags) and the fact sheet. |

## Run order

```bash
cd books/<book>
uv run --with pillow python social/gen_hooks.py        # hooks.json + quotes.json
uv run --with pillow python social/gen_images.py all    # ~70 stills
uv run --with pillow python social/gen_video.py         # audiograms
uv run --with pillow python social/gen_trailer.py        # trailer
uv run --with pillow python social/gen_teasers.py         # 29 teasers (resumable)
bash social/make_presskit.sh                              # zip -> GCS
```

Then write `COPY.md` + `PRESS.md` for the new book (start from the reference book's
and swap the specifics).

## Motion-graphics conventions

- **No `drawtext`.** ffmpeg here lacks it. Animated text is a **Pillow RGBA frame
  sequence** (or transparent PNG) composited via ffmpeg `overlay` + `fade`. See
  `atext()`/`ease()` (easeOutCubic slide) and `glow_text()`/`gtext()` (cheap
  blurred neon halo, pulsed with a sine) in the generators.
- **Glow-pulse** lives on the CTA lines only — "NOW STREAMING" and the domain.
  Keep it subtle (`0.28–0.60` halo alpha, ~2.4 rad/s).
- **Waveforms** use `showwaves … colors=0x00F0FF|0xFF1493` (cyan→pink) — the brand
  signature. Every audio-backed asset gets one.
- Kicker on everything: **"A SPACE PIRATE ZERO TRANSMISSION"** (JetBrains Mono, cyan).
- Verify motion by extracting frames (`ffmpeg -ss <t> -i out.mp4 -frames:v 1`) at a
  mid-animation and a settled timestamp before declaring a render good.

## The full library (per book)

3 hero videos (trailer + 2 audiograms) + **29 episode teasers** = 32 videos, plus
~70 stills. That's a month-long daily drip: one teaser + one episode card per day.

## Cost & housekeeping

- `gen_hooks.py` is one paid Opus call; images/video are local (Pillow/ffmpeg, free).
- The built `press-kit.zip` is large (100 MB+) — it's a build artifact, hosted on
  GCS and **git-ignored**. Rebuild with `make_presskit.sh`; don't commit it.
