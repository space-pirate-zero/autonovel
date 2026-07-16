# The Maneki Neko Death Cult

An "Advent Calendar of Death" — 24 Twilight-Zone doors, one per cocktail /
dead-artist saint, produced as a **scored audio drama** (~10.5 h) plus the
24-track companion album ***Signal Finds Signal***. Gonzo time-slip cyberpunk;
**Space Pirate Zero is the protagonist** (the time-slipper), not just the
narrator. A transmission from Spaceship Alpha 9 ([UNIVERSE.md](../../UNIVERSE.md)).

**Status: fully produced.** All 24 doors voiced, scored, and mixed; album
produced. Release prep (album) on branch `album-release-tmp`; domain
`signalfindssignal.com` registered and parked.

## Format — this book is not the standard pipeline

No manuscript, no print build, no `run_pipeline.py`. It's audio-first
periodical fiction. The design docs are bespoke:

| Doc | What |
|---|---|
| `format.md` | the 24-door periodical format |
| `audio.md`, `scoring.md` | audio drama production + scoring design |
| `album.md` | the companion album (track-per-door, lyrics) |
| `physics.md` | time-slip rules |
| `SUNO_PROMPTS.md`, `suno_parts/` | per-track Suno lyrics + style prompts |
| `outline.md`, `canon.md`, `characters.md`, `voice.md`, `world.md` | story foundation |

## Content + audio

- `chapters/ch_NN.md` + `ch_NN.audio.md` — 24 doors, prose + audio script.
- `audio/` (~2.1 GB, indexed metadata-only in asset-mcp): per-door mixed mp3s
  + voice stems, `album/`, `music/`, `songs/`, `produced/`, `samples/`,
  `assets/` (beds, stings, needle-drops), `show_intro.mp3`.

## Tools (`tools/`)

- `compose_songs.py` — regenerate album tracks via ElevenLabs
  `composition_plan` (era-forward, no static intro, mastered). Sung duet by
  default (parses `album.md` lyrics); `--instrumental` for beats.
- `produce_song.py <door>` — full production: demucs-split the VOX song, find
  vocal-free pockets, place that door's spoken samples (intro thesis + mid +
  haunted outro), master → `audio/produced/ep NN _song_FINAL.mp3`.
- `mix.py`, `record.py`, `assemble.py`, `detag.py` — mixing, VO recording,
  episode assembly, tag cleanup.

## Brand notes

The sonic brand engine (~70 BPM industrial-goth, maneki-neko bell, −16 LUFS)
was born here and is codified in [brand/spz/sonic.json](../../brand/spz/sonic.json).
Enforcement checklist: [brand/spz/ENFORCEMENT.md](../../brand/spz/ENFORCEMENT.md).

## Next

1. Publish the show through [publishing/](../../publishing/README.md) (new
   `config.json` show block) when release is greenlit.
2. Album release (branch `album-release-tmp`) + stand up
   signalfindssignal.com.
