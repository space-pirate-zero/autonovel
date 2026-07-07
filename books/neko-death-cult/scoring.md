# Scoring the Audiobook — making each episode a produced show

Goal: the spoken episode should feel like a **produced audio drama**, not a reading —
a branded open, a recurring theme, scene-specific underscore, and a proper close.

**Core rule: score with INSTRUMENTALS.** The narration is never fought by sung lyrics.
The door's *song* (the album track) becomes the episode's **theme** only in its
**instrumental** form; everything under the spoken word is instrumental. (Generate each
in Suno with **Instrumental mode ON** — no vocals, no lyrics.)

## Produced-episode anatomy (every episode)
1. **OPEN (~25–30 s)** — series **logo sting** → **main theme** swells → the **series
   identifier** voice over it (ducked), then a swell into the story. *(Demo built:
   `audio/produced/ep01_open.mp3` — uses the Track 1 instrumental as a stand-in theme.)*
2. **COLD OPEN / HOOK** — theme motif drops to a low bed; the story begins.
3. **SCORED NARRATION** — scene-specific instrumental beds under the spoken word,
   ducked ~‑16 dB, swelling at beats; theme motif returns at emotional peaks.
4. **STING TRANSITIONS** — the needle-lift / paper-door SFX at scene breaks (have these).
5. **OUTRO / END CREDITS** — theme reprise + the whispered mantra, fading out.

## Music assets needed for Ep1 (generate in Suno, Instrumental mode)

**A. SERIES MAIN THEME — "Signal Finds Signal" (open/close, consistent every ep)**
> instrumental main-title theme for a dark cyberpunk audio drama; industrial-goth engine
> — deep distorted 808 sub-bass, pounding industrial kick, cold detuned analog synths,
> cyberpunk arpeggios, strobe-hum drone, vinyl/VHS grit, neon reverb, a ghost of Fosse
> muted trumpet; one haunting romantic motif that builds to a full cinematic swell then
> drops to a loopable bed; ~70 BPM; instrumental, no vocals

**B. SERIES LOGO STING (~8 s, under the identifier voice)**
> short cinematic sound-logo, dark cyberpunk-goth; a paper-tear whoosh into a deep 808
> hit and a rising neon-synth swell, vinyl crackle, a single distant beckoning-cat bell;
> ominous, branded, ~8 seconds; instrumental, no vocals

**C. THE VAULT — club bed** *(Atlanta '03 club: the DJ booth, Kat dancing, the OD)*
> instrumental underscore of an early-2000s industrial-goth nightclub heard through the
> walls (EBM / cyber-goth); pounding four-on-the-floor industrial kick, distorted 808,
> cold synth stabs, strobe-hum, fog-machine hiss; hypnotic, menacing, loopable, mixed
> low for dialogue; instrumental, no vocals

**D. CATHEDRAL OF WIRES — the between**
> instrumental, cavernous glitching techno-gospel; reverberant choir pads, a distant
> broken church organ, dial-up modem static, granular glitches, deep sub drones; ethereal,
> sacred and broken, unsettling; slow ambient; instrumental, no vocals

**E. THE MOTEL / THE CULT — cold dread** *(the two agents' scene)*
> instrumental, cold minimal dread underscore; one detuned drone, sparse sub-bass pulses,
> fluorescent hum, a faint clock tick, vast empty reverb; affectless, bureaucratic,
> menacing by restraint; very sparse and quiet, for dialogue; instrumental, no vocals

**F. THE EUROPA — clean, wrong dawn** *(Belfast morning, the bearded man)*
> instrumental, warm but uncanny morning ambience; soft Rhodes, gentle analog pads,
> distant birdsong and cutlery, a faint detune under the warmth so it feels too clean,
> too safe; tender and wrong; slow; instrumental, no vocals

**G. THE EXPLAINER — cosmic jukebox** *(the universe/track-travel aside)*
> instrumental cosmic lofi; dreamy downtempo, warped tape, celestial pads, a slow
> arpeggio like a jukebox turning through the years, deep 808 heartbeat, vinyl crackle,
> starfield reverb; awe and dread; ~70 BPM; instrumental, no vocals

**H. OUTRO / END CREDITS**
> instrumental end-credits reprise of the main theme, industrial-goth cyberpunk; the
> romantic motif swelling then dissolving into a long reverb tail; unresolved, cinematic;
> ~70 BPM; instrumental, no vocals; fades out

**I. UNDERBED (subtle, full-length)** *(optional floor of tension the whole way through)*
> instrumental, very quiet subliminal dark ambient drone; sparse, almost inaudible, a
> faint low hum of tension under spoken narration; no melody, no drums; instrumental, no vocals

**SFX (already generated):** cold-open sting (paper door + needle drop), needle-lift
scene transitions. In `audio/assets/`.

## Ep1 cue map (which asset under which section)
| Section | Bed |
|---|---|
| Open | Logo sting (B) → Main theme (A) + identifier voice |
| Hook / Frame / calendar | Underbed (I) + faint Main theme (A) |
| The Vault (dance, the OD) | The Vault (C) |
| Cathedral of Wires | Cathedral (D) |
| The motel / the Cult | Motel/Cult dread (E) |
| Universe explainer | Cosmic jukebox (G) |
| The Europa / bearded man | Europa (F) |
| The moral / close | Main theme (A) swells |
| Outro / credits | Outro (H) + whispered mantra |

## Assembly (what I do once the assets exist)
Extend `mix.py` (or the same cue-aligned method) to: prepend the produced OPEN; lay
each instrumental bed under its scene (ducked ~‑16 dB, faded, looped to length); drop
the SFX at scene breaks; bring the Main theme up at peaks; append the OUTRO with the
mantra. Voice stays fully intelligible throughout. Output a single polished episode mp3.
The door's theme is INSTRUMENTAL under the voice; the sung song lives on the album.
