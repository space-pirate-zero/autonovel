# Digital Insurgency — Section Score (Sonic Signposting)

Every episode is built from the same handful of sections. This document gives each
section a **distinct sonic signature** so a listener knows, by ear alone and within
a second, that they've crossed into a new section — even with their eyes closed,
even mid-dishes. Same section = same sound, every episode. The listener learns the
grammar by Ep 02 and never gets lost after that.

> **Audio is deferred.** This is the score *design* + the section *markers*. The
> cue assets (stings, beds, transitions) are produced at the recording gate, not
> now. `apply_score.py` stamps the cue markers into the scripts so the read and the
> eventual mix both know where every boundary is.

## The two rules that make boundaries unmissable

1. **Texture contrast at every seam.** Adjacent sections must differ in *bed
   texture*, not just melody — ambient bed → dry pulse → intimate lo-fi → punchy
   CTA → theme. The ear catches a texture change even when it misses a tune.
2. **A hard seam.** Between any two sections: a one-shot **boundary SFX** + ~0.6s
   of near-silence before the new bed enters. The silence is the signpost; the SFX
   is the street sign.

## Sonic palette (SPZ brand: cyberpunk pirate-radio, Atlanta, lo-fi punk)

- **DI theme motif** — a 3-note descending synth arpeggio, cold cyan (#00f0ff
  energy): the show's signature. Stated at SIGNAL IN, resolved at SIGNAL OUT.
- **The physics pulse** — a dry, close, reverb-less metronomic tick + a bright
  marimba/pluck. "Class is in session." Clarity over vibe.
- **The confessional bed** — vinyl crackle + a lone Rhodes chord + Waffle-House room
  tone. Warm, intimate, human. SPZ talking straight to you.
- **The server-room bed** — a 50–60 Hz hum + sparse synth pad + distant city. The
  Broadcast's world.
- **Boundary SFX** — a short shortwave "re-tune" chirp/whoosh. The connective tissue.

## Section score table

| Section marker | Label | Transition IN | Bed under section | OUT |
|---|---|---|---|---|
| `[SIGNAL IN — …]` | **SIGNAL IN** | Shortwave tune-in sweep + static burst → **DI theme motif** (~4s) | theme tail ducks under the first VO line | hard cut to Broadcast |
| `[COLD OPEN — THE BROADCAST]` | **BROADCAST** | downward "dive" whoosh into the scene | **server-room bed** at −18 dB under the whole scene | pull the bed on the last line |
| `[THE LESSON — …]` | **LESSON** | hard cut, bed drops out; **physics pulse** starts | dry physics pulse; a rising **data-stinger** blip on each equation named | pulse stops cold |
| `[DISPATCH 01/02/03 — …]` (Ep 12) | **DISPATCH** | teletype/dial burst + a **location stinger** | light per-vertical procedural bed (bank / hospital / mill); physics pulse returns for the math | stinger + silence between dispatches |
| `[THE CHEATSHEET]` / `[THE INFILTRATION CANVAS]` (Ep 14) | **BRIEFING** | steady "briefing" bed (soft tick + pad) | data-stinger per equation; a **page-turn click** between Canvas fields | soft fade |
| `[THE SPZ CLOSER]` | **CLOSER** | everything drops; a warm chord **blooms** (the "sit-down" cue) | **confessional bed** (vinyl + Rhodes + diner) | crackle holds under the last word |
| `[FIELD ASSIGNMENT]` | **ASSIGNMENT** | one decisive percussive **hit** + a rising two-note "go" figure | short, punchy CTA motif — energizing, ~10–15s | button, then silence |
| `[SIGNAL OUT]` | **SIGNAL OUT** | **DI theme motif reprise**, now resolved/complete | — | radio-off click → static fade → silence |

## Inline marker format (what `apply_score.py` writes)

Directly under each section header, one blockquote line:

```
## [THE SPZ CLOSER]
> ♪ **SCORE — CLOSER** · everything drops, warm chord blooms (the "sit-down" cue) · confessional bed: vinyl + Rhodes + diner room tone · crackle holds under the last word.
```

It's a production marker (not read aloud). The narrator reads *through* it; the
mix lays the cue at that timestamp. Markers are idempotent — re-running the tool
never duplicates them.

## Asset list to produce at the recording gate (deferred)
- `theme_signal_in.wav` (~4s) + `theme_signal_out.wav` (resolved reprise)
- `bed_serverroom.wav` (loopable), `bed_confessional.wav` (loopable),
  `pulse_physics.wav` (loopable), `bed_briefing.wav` (loopable)
- `sfx_boundary.wav` (re-tune chirp), `sfx_dive.wav`, `stinger_data.wav`,
  `stinger_location.wav`, `hit_assignment.wav` + `motif_go.wav`,
  `sfx_pageturn.wav`, `sfx_radio_off.wav`
- Keep everything in the SPZ palette; theme motif is the through-line across the
  whole SPZ network so the show is recognizably part of it.

## Applying / maintaining the markers
```bash
# from the book dir — stamp cue markers under every section header (idempotent)
python3 audiobook/apply_score.py            # all scripts
python3 audiobook/apply_score.py ep_05      # one script
python3 audiobook/apply_score.py --check    # verify every section is marked (CI-style)
```
Re-run after any script is added or its section headers change.
