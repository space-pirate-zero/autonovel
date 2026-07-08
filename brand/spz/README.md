# SPZ Brand Kit — Voices

The reusable voice identity for **Space Pirate Zero (SPZ)** productions.

## The hero voice

**NARRATOR = Space Pirate Zero.** A custom ElevenLabs Voice Design voice — raspy, faint
Belfast lilt, raw punk nihilist who turns tender. This is *the* SPZ narration voice.
Reuse it for any SPZ narration, brand spot, trailer VO, or audio drama.

```
voice_id:  8bOIcU4hJx9LYJV4NS1I
provider:  ElevenLabs
model_id:  eleven_v3
settings:  stability 0.5 · similarity_boost 0.85 · style 0.35 · speaker_boost on · speed 1.08
```

## Files

- **`voices.json`** — machine-loadable profile: the hero NARRATOR voice plus the full
  supporting cast (KAT, WOMAN, MAN, BEARDED, GUEST) with IDs, model, and per-role
  `voice_settings`. Includes usage notes and a copy-paste Python snippet.

## Quick start

```bash
set -a; . /Users/gregchambers/autonovel/.env 2>/dev/null; set +a   # loads ELEVENLABS_API_KEY
uv run --with elevenlabs python3 - <<'PY'
import os, json
from elevenlabs.client import ElevenLabs
kit = json.load(open(os.path.expanduser('~/.claude/brand/spz/voices.json')))
spz = kit['voices']['NARRATOR']
c = ElevenLabs(api_key=os.environ['ELEVENLABS_API_KEY'])
audio = c.text_to_speech.convert(voice_id=spz['voice_id'], model_id=spz['model_id'],
                                 text="[dry] Signal finds signal.", voice_settings=spz['voice_settings'])
open('spz.mp3','wb').write(b''.join(audio))
PY
```

## Gotchas (learned in production)

- **Keep NARRATOR stability ≥ 0.5.** `eleven_v3` silently drops chunks of text below that.
  The recorder has a drop-guard (retry when the response is < ~220 bytes/char).
- **`[delivery]` tags work** — put `[dry]`, `[building]`, `[raw]` at the start of a line and
  v3 acts them. Great for expression.
- **`<break time="0.4s"/>` is ignored** by v3 — insert real silence in post (ffmpeg
  `anullsrc`) where you need beats.
- **Use the native `speed` setting**, not ffmpeg `atempo`. NARRATOR rides at 1.08.
- **Key**: `ELEVENLABS_API_KEY` in the autonovel parent `.env`. Never hard-code it.

## Provenance

Values are the exact `CAST` / `ROLES` from `books/neko-death-cult/tools/record.py`,
battle-tested across the full 24-episode scored audio drama *The Maneki Neko Death Cult*
(~10.5h) and its 24-track companion album *Signal Finds Signal*.
