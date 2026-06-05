# Memory — autonovel (append-only log)

## 2026-06-04 — Digital Insurgency setup
- Created branch `autonovel/digital-insurgency`.
- Hand-authored the foundation from the seed bible: world.md, characters.md,
  outline.md (Prologue + 16 ch + appendices, `### Ch N:` headers), voice.md
  (Part 1 preserved; Part 2 = SPZ voice), canon.md (24 equations + hard facts).
- Added NEW `influences.md` (20 real figures) and wired it into draft_chapter.py
  (loads influences.md + seed.txt; retargeted from the fantasy book; system
  prompt + body rewritten for the spec-ops chapter format; BOOK_TITLE env added).
- Wrote seed.txt (master brief + Chapter Format Template).
- Chapters: ch_00-03 scaffolds (Prologue+Ch1-3, originals in external .docx);
  ch_04, ch_05 full v0 drafts imported; ch_06-16 scaffolds (v0 prose importable).
- state.json: phase=drafting, total=16, drafted=0, with run-path notes.
- .env created from example (gitignored); ANTHROPIC_API_KEY still a placeholder —
  user to add from console.anthropic.com.
- Bootstrapped this .wolf/ directory (did not exist before).

## 2026-06-04 — Pipeline run attempt (blocked on billing)
- API key added to .env (gitignored). Smoke test: key AUTHENTICATES; models
  claude-sonnet-4-6 and claude-opus-4-8 both VALID. Set REVIEW model to
  claude-opus-4-8 (was claude-opus-4-6, unconfirmed).
- BLOCKER: account has zero API credit ("credit balance is too low"). Pipeline
  not launched. User must add credits at console.anthropic.com/settings/billing.
- Run command when unblocked: `uv run python run_pipeline.py` (resumes at
  phase=drafting -> drafting/revision/export; skips foundation). Drafting loop is
  ch_01..ch_16; Prologue ch_00 is front matter, drafted separately.
