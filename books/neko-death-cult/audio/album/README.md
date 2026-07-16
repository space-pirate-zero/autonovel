# *Signal Finds Signal*
### The companion album to *The Maneki Neko Death Cult*

A 24-song cycle — **one track per door.** A male-led torch duet: **SPZ** is the lead, an intimate crooner of devotion and ruin; **Cosmic Swing Kat** answers him back. Under the whole record, plainly, it is a love letter to **Daniela**.

The sound is **lofi industrial goth** — tape-saturated drum machines, cold analog synths, enormous distorted 808s, cyberpunk neon reverb, a ghost of Fosse cabaret — and on every track the **door's era rides up front as a co-lead**, not a tint. Each song does double duty in its episode: the **cold-open intro**, then a ducked **instrumental score** under the narration, haunted by the show's own spoken lines woven back into the music.

---

## Contents of this release folder (`audio/album/`)

| File | What it is |
|---|---|
| [`README.md`](README.md) | This front door |
| [`ALBUM.md`](ALBUM.md) | Master status manifest — locked vs. pending, filenames, lengths |
| [`LYRICS.md`](LYRICS.md) | Full 24-track lyrics booklet |
| [`CREDITS.md`](CREDITS.md) | Writing / performance / production / tooling credits |
| [`cover/`](cover/) | Cover-art slot + art-direction spec |
| `NN_<slug>.mp3` | The locked, ordered final masters |

**Upstream sources** (the truth these are built from): lyrics & per-track style/concept live in [`../../album.md`](../../album.md); Suno inputs per track in [`../../suno_parts/`](../../suno_parts/); working/alternate takes in [`../songs/`](../songs/) and [`../produced/`](../produced/).

---

## Tracklist

| # | Title | Door | Status |
|--:|---|---|---|
| 01 | Never Supposed to Be Here | Belushi | 🔒 locked |
| 02 | Indra (Painting With Light) | Joplin | 🔒 locked |
| 03 | Slow Enough to Stay | Pimp C | 🔒 locked |
| 04 | Weather in Your Hands | Hendrix | 🔒 locked |
| 05 | Edge of the Light | Marilyn | ⬜ pending |
| 06 | A Name Outlives the Man | Morrison | ⬜ pending |
| 07 | Don't Go Dark | Hemingway | ⬜ pending |
| 08 | Forty Screens | Anna Nicole | ⬜ pending |
| 09 | Hold Me While I Flicker | Cobain | ⬜ pending |
| 10 | Caught in a Trap | Elvis | ⬜ pending |
| 11 | One Floor Up | Whitney | ⬜ pending |
| 12 | Count the Doors | Europa | ⬜ pending |
| 13 | Held in Contempt | Lenny Bruce | ⬜ pending |
| 14 | Cash from Chaos | Sid Vicious | ⬜ pending |
| 15 | The Mask Eats the Man | Heath Ledger | ⬜ pending |
| 16 | One Jump Left | Amy Winehouse | ⬜ pending |
| 17 | You Can't Rewind | Michael Jackson | ⬜ pending |
| 18 | Buy the Ticket | Hunter S. Thompson | ⬜ pending |
| 19 | Quality Control | Davos | ⬜ pending |
| 20 | Nobody Gets Out | Dubai | ⬜ pending |
| 21 | Signal and Its Merch | GG Allin | ⬜ pending |
| 22 | Last Solid Night | River Phoenix | ⬜ pending |
| 23 | The Only Way Is Through | The Sealed Door | ⬜ pending |
| 24 | Signal Finds Signal | Door Zero (title track) | ⬜ pending |

**4 / 24 masters locked.** See [`ALBUM.md`](ALBUM.md) for the authoritative status, filenames, and lengths.

---

## Format / specs

- **24 tracks**, one per door, album-ordered to follow the show's door sequence.
- Masters: MP3, 44.1 kHz, 192 kbps, mastered to ~**-10 LUFS** (loudnorm + limiter).
- Each master is **SAMPLED** — the Suno vocal take with the door's spoken samples woven into its vocal-free pockets under sidechain ducking.
- Voice direction: `[Male Vocal]` = SPZ, `[Female Vocal]` = Kat, one `[Duet]` hook. (`[Both]` is avoided — it drifts the voice assignment in Suno.)

---

## Status / how to finish locking

Tracks **01–04 are locked** from the curated `a+_neko` set. Tracks **05–24 are pending final masters**: the lyrics are rewritten and committed, and fresh Suno vocal takes are downloaded to `~/Downloads/suno_raw` (+ `a+_neko/suno_raw`), but the **resample** that welds the spoken samples into each new take and writes the final master has not yet completed for 05–24. Once those `epNN_song_FINAL.mp3` are rebuilt from the new takes, promote each into this folder as `NN_<slug>.mp3` and flip its row to **LOCKED** in [`ALBUM.md`](ALBUM.md).

Pipeline: `tools/compose_songs.py` (generate) → Suno vocal take → `tools/produce_song.py --suno NN` (weave samples + master).
