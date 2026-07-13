# Standard: Full-Cast Audiobook Production

How to turn a finished manuscript into a scored, full-cast audiobook where every
chapter opens with the SPZ theme and a Space-Pirate-Zero host-intro. Reference
implementation: `books/the-last-human-ceo/`. Frozen recipe:
`books/<book>/audiobook/PRODUCTION_SPEC.md`.

## Inputs

- `books/<book>/chapters/ch_NN.md` — one `# Chapter N — Title` heading per file;
  the coda is `ch_coda.md`.
- `.env` at repo root — `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`,
  `GEMINI_API_KEY` (or the imagegen skill's key).
- `brand/spz/sonic.json` — the sonic identity the theme must match.

## The tools (port these per book)

| Script | Role |
|---|---|
| `gen_audiobook_script.py` | Manuscript → speaker-attributed JSON. Streams Opus (`claude-opus-4-8`), one call per chapter, so a long chapter can't time out. Slots: `0` = front-matter, `1..28` = chapters, `29` = coda. Resumes (skips slots already parsed). |
| `audiobook_voices.json` | Maps each speaking role → an **SPZ brand voice ID** + `model_id` + `voice_settings` + `strip` rules. Narrator + machine voice + the cast. |
| `render_audiobook.py` | Per-segment ElevenLabs TTS with a **drop-guard** (re-render if a segment returns silence/short), real inter-segment silence, ffmpeg stitch + coalesce. Raises `QuotaExceeded` and stops on `quota_exceeded` — never burns credits blindly. Resume via `FORCE_RENDER`. |
| `gen_theme.py` | The show theme via the **ElevenLabs Music API** (`music.compose` with a `composition_plan`), plus the ducked SPZ title-card intro. |
| `gen_chapter_intros.py` | Per-chapter SPZ **host-intros** — reader-POV: a bit about the book, a bit about the story so far, a bit about how this chapter opens. Varied openers, **no twist spoilers**. Renders the VO. |
| `produce_chapter.py` | Wraps each chapter: intro VO + theme bed + crossfades → `ch_NN_PRODUCED.mp3`. `--assemble` stitches the whole book. |

### Voice model rules

- **Narration & human characters:** `eleven_v3` with inline performance tags
  (`[whispers]`, `[sighs]`, …). Convert per segment with `text_to_speech.convert`
  — **not** `text_to_dialogue`.
- **The machine / AI voice:** `eleven_multilingual_v2` (flatter, uncanny).
- Only ever assign **SPZ brand voice IDs**. A new book re-casts by editing
  `audiobook_voices.json`; it does not introduce off-brand voices.

## The transition (the part that's easy to get wrong)

The intro→chapter hand-off must be **seamless**, not jerky. The fix that worked:
build the intro over a *continuous ducked bed taken from a musical passage of the
theme* (e.g. `bed_start=46s`), **not** the sparse title-card bed. `produce_chapter.py`'s
`intro_over_chapter()` holds that bed under the VO and crossfades into chapter
audio. Keep this — it's why the openings feel produced.

## Run order

```bash
cd books/<book>
# 1. parse manuscript -> speaker JSON (resumable)
uv run python gen_audiobook_script.py
# 2. theme + title-card intro (one-time per book)
uv run python gen_theme.py
# 3. per-chapter host intros
uv run python gen_chapter_intros.py
# 4. render + produce, act by act (detached so teardown can't kill it)
nohup bash run_act1.sh  >act1.log 2>&1 & disown     # chapters 0–9
nohup bash run_act2.sh  >act2.log 2>&1 & disown     # 10–20
bash finish_book.sh                                  # remaining + coda, then --assemble
```

Outputs land in `books/<book>/audiobook/produced/ch_NN_PRODUCED.mp3` (+ a stitched
full-book file). These are what the publishing pipeline uploads.

## Episode art

- `gen_episode_art.py` — Gemini `gemini-2.5-flash-image` (anime key art). Holds a
  `STYLE` block + a character sheet + a `SCENES` dict (one scene per chapter).
  **Hardened no-text clause** — the model must not bake letters/headlines/logos;
  strip text-inducing nouns (brand names, magazine, headline) from prompts. If a
  render sneaks in text artifacts, regenerate that scene.
- `embed_episode_art.py` — upscales `epNN.png` → `epNN.jpg` (1500²) and embeds it
  as the ID3 cover of `ch_NN_PRODUCED.mp3`. Always extract audio with
  `-vn -map 0:a` afterwards so the embedded cover can't break audio tooling.

## Gotchas (all logged in `.wolf/buglog.json`)

- `claude-opus-4-8` rejects a `temperature` param — omit it.
- Long chapters hit `httpx.ReadTimeout` on non-streamed calls — **stream** (the
  read timeout resets per chunk) and retry.
- ElevenLabs `quota_exceeded` is a billing limit, not a bug — top up, then resume.
- Session teardown kills foreground renders — always launch detached.
