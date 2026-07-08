# SPZ Brand Kit

The full brand identity for **Space Pirate Zero (SPZ)** — the author-persona and
label behind the *Digital Insurgency* books, the *Maneki Neko Death Cult* audio
drama, and the *Signal Finds Signal* album.

> **Tagline / lockup:** *Signal finds signal.*

> ## ★ THE brand kit — the one and only
> **[`brand_kit.html`](brand_kit.html)** is the canonical, definitive SPZ brand kit:
> an interactive, playable board (embedded fonts + real brand audio, live
> audio-reactive visualizers, microanimations). Everything else in this folder is
> its source data.
> **Live:** https://claude.ai/code/artifact/753aa02e-8d51-4f64-98e4-a9fe2bd46aa0
> **To change it:** edit `build_brand_kit.py` and redeploy to the *same* URL — never fork a variant.

Every value here is extracted from the real production system (cover/design scripts,
`fonts/`, the scoring bible, and `tools/`), not invented — so anything you build with
it matches what already shipped.

## Contents

| File | What it holds |
|---|---|
| **`brand.json`** | Top-level manifest — essence, productions, quick-reference lockup, and index. Load this first. |
| **`verbal.md`** | Voice & tone: who SPZ is, the two gears (Serling frame / Thompson scene), the dials, banned words, the mantra. |
| **`voices.json`** | The ElevenLabs voice cast. Hero **NARRATOR = SPZ** (`8bOIcU4hJx9LYJV4NS1I`) + full supporting cast, settings, gotchas, Python snippet. |
| **`palette.json`** | Colors: `void #030303`, `pink #FF1493`, `cyan #00F0FF`, `paper #E8E8E8`, `muted #8A90A0`. |
| **`typography.json`** | Type: **Orbitron** (display) · **Space Grotesk** (body) · **JetBrains Mono** (code) · EB Garamond (alt serif). |
| **`sonic.json`** | Sound: industrial-goth engine ~70 BPM, main theme + logo sting + 6 scene beds + the full mix/mastering chain. |
| **`links.json`** | Presence pulled from spacepiratezero.com — site, taglines, the operator (Greg Chambers / Spaceship Alpha 9 / patents), social, streaming, studio. |
| **`catalog.json`** | The 6 released albums (Lambada on Saturn's Rings, Afternoon Delight, Vaudeville Nebula, The Yellow 5, американское порно, Tentacle Love) + streaming + in-production work. |
| **`studio.json`** | Spaceship Alpha 9 (SPZ's parent studio) pulled from the private SA9 repo: 16-product roster, 8-principle manifesto, Space Tokens, 5 design systems, and full StyleLift detail. |

## The lockup at a glance

- **Look:** cyberpunk-noir. Two neons on a near-black void — hot **pink** and cold
  **cyan**, separated by **void**, text in dirty **paper** white. Newsprint/VHS grit.
- **Type:** Orbitron shouts, Space Grotesk speaks, JetBrains Mono computes.
- **Sound:** deep distorted 808, industrial kick, cold synths, a single beckoning-cat
  bell, a ghost of muted trumpet. ~70 BPM. *Signal Finds Signal.*
- **Voice:** *someone talking at a bar at midnight* — raw, punk, nihilist-cool, a
  touch of Belfast. **Punch up, never down.** Active voice only.

## Locations

- **`brand/spz/`** in the repo — version-controlled, durable.
- **`~/.claude/brand/spz/`** — global, grab-and-go from any project.

Both are kept in sync. Source of truth for the *voice IDs* stays
`books/neko-death-cult/tools/record.py`; for *color/type* it's the cover/design
scripts; this kit is the durable, reusable snapshot.

## Reuse

```bash
# The whole brand at a glance
cat ~/.claude/brand/spz/brand.json

# Generate SPZ narration (loads the key from the autonovel parent .env)
set -a; . /Users/gregchambers/autonovel/.env 2>/dev/null; set +a
uv run --with elevenlabs python3 - <<'PY'
import os, json
from elevenlabs.client import ElevenLabs
spz = json.load(open(os.path.expanduser('~/.claude/brand/spz/voices.json')))['voices']['NARRATOR']
c = ElevenLabs(api_key=os.environ['ELEVENLABS_API_KEY'])
a = c.text_to_speech.convert(voice_id=spz['voice_id'], model_id=spz['model_id'],
                             text="[dry] Signal finds signal.", voice_settings=spz['voice_settings'])
open('spz.mp3','wb').write(b''.join(a))
PY
```
