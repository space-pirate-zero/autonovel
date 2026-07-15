# Digital Insurgency — 2nd Edition ("The Recording Edition")

*Status: setup / pre-recording. No audio produced yet.*

The 2nd Edition re-cuts *Digital Insurgency* from a read-once field manual into a
**14-episode audio field course** — the same pattern used for the *Defense Against
the Dark Arts* podcast: a non-fiction lesson wrapped in a serialized cyberpunk
broadcast, dropped one module at a time to an RSS feed the listener subscribes to.

The 1st Edition already carries the right spine. Every chapter is built as
**BROADCAST → LESSON → SPZ CLOSER**:

- **THE BROADCAST** — a cold-open vignette from "The Broadcast" (ZERO, GHOST,
  BISHOP, REAPER). This is the story.
- **THE LESSON** — the physics: equations with variable defs, traffic-light
  benchmarks, and worked field reports. This is the course.
- **THE SPZ CLOSER** — Space Pirate Zero speaks to the listener directly, pulls
  the human lesson out of the scene, and throws forward to the next drop.

The 2nd Edition formalizes that spine into a **recordable episode format** and
sets up the podcast to distribute it. This document is the charter for the pass.

---

## What changes in the 2nd Edition

1. **Episodic re-cut.** The Prologue + 16 chapters + 2 appendices are grouped
   into **14 self-contained episodes** across three modules (see
   [podcast/episodes.md](podcast/episodes.md)). Each episode is a complete lesson
   with its own cold open, physics, field report(s), and closer — listenable
   without the others, rewarding in sequence.

2. **Recording-ready scripts.** Each episode gets a speaker-attributed audio
   script under [audiobook/scripts/](audiobook/scripts/) — NARRATOR / SPZ, ZERO,
   GHOST, BISHOP, and boss archetypes, with ElevenLabs v3 delivery tags. Prose is
   adapted for the ear: equations are *spoken* ("R-extinction — generic lines over
   authentic lines, times AI velocity"), field reports are read as dispatches,
   on-screen config/log lines become read-aloud beats.

3. **Course framing added.** A new **Orientation** episode (Ep 01) states the
   Five Claims and the Mirror Test up front and hands the listener the through-line
   (the Dorian Gray portrait, healing four percent at a time). Every episode ends
   with a concrete **field assignment** — one thing to go measure or try before the
   next drop.

4. **Expanded field reports.** The three case-study chapters (Ch 13–15: Fortress
   Run / Paperclip Maximizer / Propaganda Farm) are expanded to full-template
   dispatches and promoted to their own module beat (Ep 12), the course's
   "here's it working in the wild" payoff.

5. **The Field Kit as a reference episode.** Appendix A (24-equation cheatsheet)
   and Appendix B (the Infiltration Canvas) are re-cut as Ep 14 — a "gear up"
   reference the listener keeps.

**Non-goals for this pass:** rendering audio, buying a domain, deploying the
Cloud Run service. All of that is scaffolded and documented, deferred until the
scripts are locked and greenlit for recording.

---

## The show

- **Title:** *Digital Insurgency*
- **Tagline:** *Smuggle the future past the corporate immune system.*
- **Host/Narrator:** Space Pirate Zero (SPZ), transmitting from Spaceship Alpha 9.
- **Format:** Serial field course. 14 episodes, ~18–32 min each.
- **Network:** Space Pirate Zero podcast network (standalone show, own feed +
  landing + Cloud Run service — the LHCEO / Defense pattern).
- **Distribution:** GCS-hosted MP3s + RSS 2.0 feed (Apple + Spotify tags), served
  from a Cloud Run container. See [podcast/README.md](podcast/README.md).

---

## Where things live

| Artifact | Path |
|---|---|
| Episode map (14 eps, full specs) | [podcast/episodes.md](podcast/episodes.md) |
| Show + distribution config | [podcast/config.json](podcast/config.json) |
| Production / deploy guide (audio deferred) | [podcast/README.md](podcast/README.md) |
| Recording guide (cast, tags, format) | [audiobook/README.md](audiobook/README.md) |
| Section score (sonic signposting) design | [audiobook/SCORE.md](audiobook/SCORE.md) |
| Score cue stamper / checker | [audiobook/apply_score.py](audiobook/apply_score.py) |
| Voice casting map | [audiobook/audiobook_voices.json](audiobook/audiobook_voices.json) |
| Per-episode recording scripts | `audiobook/scripts/ep_NN.md` |
| Per-episode intros / show notes | `audiobook/intros/ep_NN.md` |
| Rendered audio (empty — deferred) | `audiobook/produced/` |
| 2E manuscript revision plan | [REVISION_MAP_2E.md](REVISION_MAP_2E.md) |

---

## The build, in order

1. ✅ Episode map + module structure — [podcast/episodes.md](podcast/episodes.md)
2. ✅ Show config + distribution scaffolding — `podcast/`
3. ✅ Recording guide + voice casting — `audiobook/`
4. ✅ All 14 episode intros / show notes — `audiobook/intros/`
5. ◻ All 14 recording scripts — `audiobook/scripts/` (Ep 01 locked as the
   reference template; Ep 02–14 drafting)
6. ◻ 2E manuscript revision per [REVISION_MAP_2E.md](REVISION_MAP_2E.md)
7. ◻ **Record** (deferred — greenlight gate)
8. ◻ Produce + publish (deferred — Cloud Run deploy)
