# The Last Human CEO

Literary near-future tragicomedy, ~114,000 words — *Succession* meets
*Klara and the Sun*. Narrated by Space Pirate Zero (Voice Closers; SPZ is not
in-story). A transmission from Spaceship Alpha 9 ([UNIVERSE.md](../../UNIVERSE.md)).

**Status:** drafted (28 chapters + coda; 30 chapter files). Full-cast
audiobook **Act 1 (slots 0–9) produced**; slots 10–29 pending greenlight on
branch `spz/last-human-ceo-audiobook-7bb567`. Podcast + site **LIVE**:
**https://lasthumanceo.com** — 29 episodes ≈ 12.6 h
(Apple id6790448408 · Spotify 033OSpl5KjvWx07upDLZ8M).

> This book is the **reference implementation** for all four studio pipelines
> ([standards/](../../standards/README.md)): audiobook, publishing, social,
> brand. When porting a pipeline to another book, copy from here.

## What's here

| Path | What |
|---|---|
| `chapters/` | 30 chapter files (no assembled `manuscript.md` yet — assembly pending) |
| `SYNOPSIS_FULL.md`, `PUBLISHER_PITCH.md`, `EDITOR_SUMMARY.md`, `REVISION_MAP.md`, `STYLE.md`, `SUMMARY.md` | editorial/pitch docs |
| `audiobook/` | PRODUCTION_SPEC.md (frozen settings), cover, intros, recaps, scripts |
| `render_audiobook.py`, `run_act1.sh`, `run_act2.sh`, `finish_book.sh` | audiobook production (detached, resume-safe) |
| `art/`, `gen_episode_art.py` | cover, episode art, tabloids, podcast cover |
| `social/`, `fb/` | social kit + Facebook daily-drip campaign |
| `substack/` | Substack drip |
| `kdp/`, `landing/`, `typeset/` | print/ebook + landing groundwork |
| `*.py`, `PIPELINE.md`, `WORKFLOW.md` | this book's copy of the autonovel pipeline |

## Publishing

Show config lives in [publishing/config.json](../../publishing/config.json)
(service `spz-podcast-lhceo`, bucket `gs://spz-podcasts/the-last-human-ceo`,
`public_url` lasthumanceo.com). Deploy: `cd publishing && bash deploy.sh`.

## Remaining to done

1. Greenlight + render audiobook slots 10–29 (audiobook branch).
2. Assemble `manuscript.md` and build print/ebook artifacts (`build/`).
3. KDP upload (mind the 6×9 gutter specs — past rejection logged in
   `.wolf/buglog.json`).
