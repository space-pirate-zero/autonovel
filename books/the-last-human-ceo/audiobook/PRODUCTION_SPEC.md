# Audiobook Production Spec — *The Last Human CEO*

The canonical, approved recipe for turning a rendered chapter into a polished,
music-scored deliverable. **`produce_chapter.py` is the executable version of this
spec** — this doc explains the intent; the script is the source of truth for exact
numbers. Applies to every chapter, present and future (ch 10–28 + coda included).

## Pipeline order
1. `gen_audiobook_script.py N M` → speaker-attributed `audiobook/scripts/chNN_script.json`
2. `render_audiobook.py N M` → raw narration `audiobook/chapters/ch_NN.mp3`
3. `gen_theme.py` (once) → `audiobook/theme.mp3` + `audiobook/00_intro.mp3` (+ `intro_vo.mp3`)
4. `gen_chapter_intros.py all` → per-chapter SPZ host-intro text + VO
   (`audiobook/intros/chNN.txt` + `chNN_vo.mp3`; recaps cached in `audiobook/recaps/`)
5. `produce_chapter.py all` → scored deliverables `audiobook/produced/ch_NN_PRODUCED.mp3`

## The produced-chapter template
Every produced chapter = **[spoken intro over theme] → narration → theme outro**, glued
with equal-power crossfades and loudness-matched. No hard cuts, no silent gaps.

### Voice
- Narration normalized to **−16 LUFS** (TP −1.5, LRA 11), stereo / 44.1 kHz / 192 kbps.

### Opening — EVERY chapter (`intro_over_chapter`)
A spoken SPZ intro rides a **continuous ducked music bed** that keeps playing
*underneath* the first ~13 s of the chapter, so the narration emerges out of the
theme with no seam. The intro VO differs by chapter:
- **Ch 1** → the book title card (`intro_vo.mp3`, the "There is a dimension…" cold open).
- **Ch 2+** → a generated **host-intro** (`intros/chNN_vo.mp3`): three beats — a line
  about the book, a spoiler-bounded "story so far," and a teaser of how the chapter
  opens — in the SPZ voice (`gen_chapter_intros.py`). Recaps are reader-POV; no twists
  or hidden identities are revealed early; openers are varied so 28 intros don't rhyme.

Approved bed settings (`intro_over_chapter`, timing derived from each VO's length):
- `lead_in = 2.6 s` — theme plays alone (cold downbeat) before the voiceover.
- Bed pulled from a **musical passage of the theme** (`bed_start = 46 s`) — NOT the
  sparse title-bed, so it never dips toward silence during the handoff (the fix for
  the "jerky" transition).
- Voiceover ducks the bed via `sidechaincompress` (threshold .04, ratio 12).
- `bed_len = chap_start + 14 s`; bed fades `fade_st = chap_start + 4 s`, `fade_d = 9 s`
  (chap_start = lead_in + VO length + `vo_gap` 0.9 s) → music gone ~13 s into the chapter.

### Outro — every chapter (`theme_outro`)
- Last **22 s** of `theme.mp3`, mastered to **−14 LUFS** (music sits just above voice),
  short 0.3 s fade-in (the crossfade supplies the swell), 7 s fade-out.
- Chapter **crossfades into** the outro over **2.2 s** — the theme swells as SPZ finishes.

### Front matter
- `ch_00` (the "There is a dimension beyond the org chart…" transmission) is **not**
  produced as a standalone chapter — that exact text IS the musical intro at the head
  of the produced chapter 1. `produce_chapter.py` skips slot 0 by design.

## Tunable knobs (if a future note asks for a different feel)
All in `produce_chapter.py`:
- bed level under the first lines → `sidechaincompress` threshold/ratio in `intro_over_chapter`
- how long before the bed fades → `fade_st`
- fade length → `fade_d`
- outro length / loudness → `theme_outro(secs=…, I=…)`
- crossfade lengths → the `d=` args to `crossfade(...)`

## Commands
```
uv run --with python-dotenv python produce_chapter.py all            # produce every rendered chapter
uv run --with python-dotenv python produce_chapter.py 1              # just ch 1 (with intro)
uv run --with python-dotenv python produce_chapter.py 2 9            # a range
uv run --with python-dotenv python produce_chapter.py all --force    # rebuild everything
```
