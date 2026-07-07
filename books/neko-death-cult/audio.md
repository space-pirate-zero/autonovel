# Audio Production — The Maneki Neko Death Cult *(working title)*

How each written episode becomes a voice-acted ElevenLabs narration. Companion to
`format.md` (the serial structure) and `voice.md` (the written voice).

Workflow: **author prose** (`chapters/ch_NN.md`) → **convert to a tagged script**
(`chapters/ch_NN.audio.md`, using the standard below) → **render in ElevenLabs**
(Studio for multi-voice, or the API via the repo's `gen_audiobook*.py`) → **stitch +
music/SFX** → **publish** (podcast RSS + Substack audio).

---

## Model
- **Default: ElevenLabs v3** — it reads inline delivery tags (`[dry]`, `[whispers]`,
  `[sighs]`), handles dialogue best, and gives the expressive range a Twilight-Zone
  gonzo drama needs.
- **Fallback: Multilingual v2** — more stable for long unbroken narration, but it
  does **not** honor bracket delivery tags (it would read them aloud). If rendering
  in v2, **strip all single-bracket `[tags]` first** and lean on punctuation +
  `<break>` for pacing.
- Keep a single generation to roughly **a few hundred words / one beat** at a time,
  then stitch — long single renders drift in tone. The `— · —` scene breaks are
  natural cut points.

## The Cast (voice map)
Assign each a fixed ElevenLabs voice and **never change it** across episodes —
voice continuity is how a listener tracks a character. Fill the ID once chosen; the
archetype + settings are the brief for picking from the ElevenLabs library or a
custom clone.

| Tag | Character | Voice archetype | v3 stability | Notes |
|---|---|---|---|---|
| `@NARRATOR` | **SPZ** (narrator + his own dialogue) | American male, ~40s, gravel, lived-in, dry. Atlanta under it. Bar-at-midnight. | **Natural** | The spine. Also speaks SPZ's in-scene lines — same voice. Two gears (below). |
| `@KAT` | Cosmic Swing Kat | Female, breathy, calm, otherworldly, unhurried. Says less than she knows. | **Natural** | Add a light plate-reverb in post — she's half-signal. Never rushed. |
| `@WOMAN` | The agent (woman) | **Clarissa — Upper-Class British; posh, condescending, contemptuous.** `4JHJuokHot8d75SnR53J` | **v3, stability 0.45** | Human aristocrat disdain, not robotic monotone. |
| `@MAN` | The agent (man) | **Blackwood — Sinister, Posh & British.** `agL69Vji082CshT65Tcy` | **v3, stability 0.45** | Matched posh pair with the Woman. |
| `@BEARDED` | The bearded man (CSM) | Male, warm, avuncular, soft Belfast/English edge, faintly off. | **Robust** | Calm is the threat. Never emotive. |
| `@GUEST` | Per-episode marks & bit parts (Lux, Denny, hippie kid, etc.) | Cast per episode; note the pick in that script's header. | varies | One utility voice can cover tiny bit parts; give named marks their own. |

Global v3 settings: **Speed 1.0** default (Frame gear 0.9), **Style low** (let the
writing carry it), **Similarity high**. v2 equivalents: Stability ~0.45 narration /
~0.35 for hot scene moments, Similarity ~0.8.

**Cast as recorded (Ep 1, from the account's ElevenLabs library):**
| Tag | Voice | ID |
|---|---|---|
| `@NARRATOR` | **SPZ — custom Voice-Design**: raspy, gravel, slight Belfast lilt, raw/punk/nihilist | `8bOIcU4hJx9LYJV4NS1I` |
| `@KAT` | Lily — velvety actress (UK female) | `pFZP5JQG7iQjIQuC4Bku` |
| `@WOMAN` | **Clarissa — Upper-Class British** (posh, condescending) | `4JHJuokHot8d75SnR53J` |
| `@MAN` | **Blackwood — Sinister, Posh & British** | `agL69Vji082CshT65Tcy` |
| `@BEARDED` | George — warm, captivating storyteller (UK male) | `JBFqnCBsd6RMkjVDRZzb` |
| `@GUEST` | Callum — husky trickster (US male) | `N2lVS1w4EtoT3dr4eOWO` |

Supporting cast = stock library voices. **@NARRATOR (SPZ) is a custom Voice-Design
voice** ("SPZ — Space Pirate Zero", `8bOIcU4hJx9LYJV4NS1I`): raspy, gravel, slight
Belfast lilt, raw/punk/nihilist. **SPZ render settings:** model `eleven_v3`,
`stability: 0.0` (chaos/manic variability), `style: ~0.35`, `use_speaker_boost:
true`, then a **~1.08× tempo** nudge on the final for "a little faster." Other
characters render steady (stability ~0.4–0.5) — do NOT make the agents chaotic.

**Renderer:** `tools/record.py` parses a `ch_NN.audio.md`, renders each `@SPEAKER`
run via the Text-to-Dialogue API (v3, so inline `[tags]` are acted), inserts real
silence at every `<break time="…"/>`, and stitches with ffmpeg. Run:
`source ../../.env && uv run --with elevenlabs python tools/record.py chapters/ch_NN.audio.md`
(`--limit N` for a cheap test render). Output → `audio/ch_NN.mp3`.

**Not yet applied:** a pronunciation pass — "Maneki Neko," "Belushi," "Shumate,"
"Europa" may need phoneme tags or a pronunciation dictionary if the stock read is
off.

## The two gears (delivery direction for @NARRATOR)
The written voice shifts between a Serling frame and a Thompson scene; the read
must too. Mark each block with a gear cue.
- `[[GEAR: FRAME]]` — Serling. Slower (Speed ~0.9), dry, measured, more `<break>`s.
  The narrator who already knows how it ends.
- `[[GEAR: SCENE]]` — Thompson. Present, hot, quicker (Speed ~1.0–1.05), less air.
  The drugs are working.

## Tag standard
Six things, and only six, so scripts stay clean and parseable.

1. **Speaker** — `@NAME:` at the start of a line. Tells the operator/parser which
   voice. **Not sent to TTS.** Every line has one. Runs of narration can share one
   `@NARRATOR:` across a paragraph.
2. **Delivery (v3 only)** — single brackets, inline, sparingly: `[dry]`, `[wry]`,
   `[whispering]`, `[sighs]`, `[snorts]`, `[sardonic]`, `[building]`, `[flat]`.
   These are spoken as *directives* by v3. **Fewer is better** — one per line at
   most; over-tagging degrades the read.
3. **Pause** — `<break time="1.2s" />`. Use at beats and after stings. Cap ~3s.
4. **Emphasis** — CAPS on the single word that must land (sparingly). Written
   *italics* are invisible to TTS, so promote the important ones to CAPS here.
5. **Production note / SFX / music** — **double** brackets `[[ ... ]]`. **Never
   sent to TTS.** e.g. `[[SFX: paper door tears + needle drop]]`,
   `[[MUSIC: industrial bed, low, under]]`, `[[GEAR: SCENE]]`.
6. **Numbers/pronunciation** — spell out anything ambiguous so the read is
   controlled (see lexicon). Years as words: `nineteen sixty-seven`.

Single bracket = spoken (v3). Double bracket = crew-only. That distinction is the
whole safety rule — it stops the operator piping SFX notes into the voice.

## Recurring SFX / music signature
- **Cold-open sting:** a paper advent door tearing, then a needle dropping to a
  groove. Same every episode — it becomes the show's audio logo.
- **Scene breaks (`— · —`):** needle-lift + a short ambient swell.
  `[[SFX: needle lift]] <break time="1.5s" />` at each.
- **The Cathedral of Wires:** processed, cavernous, glitching techno-gospel bed.
- **Outro tag:** the mantra ("Don't let the bastards grind you down to beige")
  spoken by `@WOMAN`, then the sting.

## Pronunciation lexicon (build up across episodes)
Feed these to ElevenLabs' pronunciation dictionary, or spell them inline.
- **Maneki Neko** → "mah-NEH-kee NEH-koh"
- **Belushi** → "beh-LOO-shee"
- **Shumate** → "SHOO-mayt"
- **Europa** → "yoo-ROH-puh"
- **Père Lachaise** (later door) → "pair lah-SHEZ"
- **Nembutal** (later) → "NEM-byoo-tawl"
- **Joplin / Janis** → normal
- Place names: **Ponce** (Atlanta) → "pahns"; **Decatur** → "deh-KAY-tur";
  **Avalon** → normal.

## Per-episode audio-script header (put at top of every ch_NN.audio.md)
Episode #, title, target runtime, model, **voices used this episode** (with the
`@GUEST` casting), and any new lexicon words. So an operator can render it cold.
