# Digital Insurgency — Recording Scaffolding

The 2nd-Edition audio field course. This folder holds everything needed to
**record** the show — but no audio is rendered yet. That's the deferred gate.

```
audiobook/
  README.md              ← you are here (cast + delivery-tag guide)
  audiobook_voices.json  ← voice casting (ElevenLabs voice IDs go here)
  scripts/   ep_NN.md     ← speaker-attributed recording scripts (Ep 01 = reference)
  intros/    ep_NN.md     ← per-episode show notes (read by publishing/gen_feed.py)
  produced/  (empty)      ← rendered ep_NN_PRODUCED.mp3 land here — DEFERRED
```

## Section score (sonic signposting)

Every section carries a **score cue** — a blockquote directly under its header
(`> ♪ **SCORE — LABEL** · …`) — so a listener *hears* when a new section starts.
Same section = same sound, every episode. The full design (palette, per-section
cues, transition rules, asset list) is in [SCORE.md](SCORE.md); the cues are
stamped/verified by [apply_score.py](apply_score.py):

```bash
python3 audiobook/apply_score.py          # stamp cues under every section header
python3 audiobook/apply_score.py --check  # CI: fail if any section is unmarked
```

The narrator does **not** read the cue lines — they're mix markers. Re-run
`apply_score.py` whenever a script is added or a section header changes. Audio is
deferred: this marks the boundaries; the cue *assets* are produced at the recording
gate (see SCORE.md).

## The episode format (every script follows this)

Mirrors the book's own spine — the 1E chapters already read this way. Each `##`
section header is immediately followed by its `> ♪ **SCORE — …**` cue line:

1. **`[COLD OPEN — THE BROADCAST]`** — the cyberpunk vignette. NARRATOR/SPZ sets
   the scene; ZERO / GHOST / BISHOP / bosses play it. This is the story hook, ~40%.
2. **`[THE PHYSICS]`** — the lesson. SPZ (or NARRATOR) teaches the equation(s)
   *spoken aloud* with variable defs and a traffic-light benchmark, then reads
   1–2 worked **field reports** as dispatches. ~35%.
3. **`[THE SPZ CLOSER]`** — Space Pirate Zero drops the mask and talks to the
   listener directly: the human lesson, the confession, the throw-forward. ~20%.
4. **`[FIELD ASSIGNMENT]`** — one concrete thing to measure or try before the next
   drop. ~5%. Then the "Next:" hook.

### Speaking the math (house rule)
Equations are for the ear, not the eye. Write the spoken form:
> "R-extinction. Generic lines of code over authentic lines, times your AI
> velocity. Above one-point-five, you're already a fossil — you just haven't
> stopped moving yet."
Never read raw symbols or LaTeX. Give the benchmark as red/yellow/green in words.

### On-screen text (config flags, logs, dashboards)
Render as a read beat, not a symbol dump:
> NARRATOR: A flag in the config she doesn't recognize. `MATCH_DELAY_ENGINE:
> ENABLED`. *[beat]* She reads the comment above it. Reads it again.

## Cast

| Tag | Character | Register |
|---|---|---|
| `NARRATOR` / `SPZ` | Space Pirate Zero | Raw, punk, confessional; Atlanta in his bones. The broadcast voice AND the closer. Warm at the worst table. |
| `ZERO` | Zara Okonkwo-Reyes (31, she/her) | Direct, technical, economical — boxing economy. Cuts her own pitch when she misreads a room. Quotes math at people. Dry, never cruel. |
| `GHOST` | The Curator (~3y, it/its) | Clinical, alien, precise. Aphorisms about selection vs. creation. Never predicts; states what it observes. A synthetic edge. |
| `BISHOP` | Marcus Bishop (47, he/him) | Measured, strategic, calm — the calmest person in any room. Speaks in chess and policy. Minimal words. |
| `SARAH` | Sarah Chen, VP Compliance | Exhausted, practical, no patience for vision. |
| `KEISHA` | the ghost in Bishop's memory (flashback) | Plain, stumbling, young. No epigrams. |
| `COUNCIL` | PRISM Architecture Board | Institutional, not sinister. One flat collective voice. "We correct inefficiencies." |
| Bosses | per-episode archetypes (the "We'll Get to It" VP, Sunk-Cost Guardian, Growth Hacker, CFO, CISO, Iron Mike, Dr. Vance, …) | Cast from the pool; keep each distinct within its episode. |

**REAPER never speaks and is never a character.** It is an environment. Its
"dialogue" is read as system notifications / automated emails by NARRATOR in a
flat machine register — never a voice line, never a speech bubble.

## ElevenLabs v3 delivery tags (use sparingly)
Emotions: `[calm] [tense] [worried] [frustrated] [hopeful] [angry] [nervous]`
Delivery: `[whisper] [softly] [firmly] [flatly] [matter-of-factly] [dryly]`
Reactions: `[sigh] [exhales]` · Pacing: `[slowly] [pause]`
Rules: one tag per segment is plenty; none is fine. `[pause]` before revelations.
SPZ closers lean `[dryly]` / `[softly]`; REAPER notifications read `[flatly]`.

## Rendering (DEFERRED — the "no audio yet" line)
When scripts are locked and greenlit:
- `gen_audiobook_script.py` is the 1E per-chapter script generator; the 2E scripts
  in `scripts/` are already speaker-attributed, so recording reads them directly.
- Render each `scripts/ep_NN.md` → `produced/ep_NN_PRODUCED.mp3` via the
  ElevenLabs v3 path in `gen_audiobook.py`, using the voice IDs in
  `audiobook_voices.json`.
- Then follow `../podcast/README.md` to publish. **Do none of this until the
  recording gate is greenlit.**
