# Cerebrum — autonovel

## Preferences (user)
- Voice = Space Pirate Zero: snarky, punk, Atlanta-trap, hacker, active voice only.
  Banned: leverage, synergy, ecosystem, transform (use "refinance"), etc. See
  voice.md Part 2.
- Weave the real-figure influences (influences.md) in HEAVILY and honestly —
  Diogenes' "deface the currency" is the spine; Wilde's Dorian Gray is central;
  Mamdani is the explicit "authenticity beats the machine" case study.
- "Everything can be rebuilt" — existing drafts are raw material, not sacred.

## Learnings (project patterns)
- The pipeline reads the foundation files, NOT seed.txt, during drafting/revision.
  To control the book, hand-author the foundation rather than rely on the
  fantasy-tuned generators (seed.py / gen_world.py etc. assume fantasy).
- `draft_chapter.py` `extract_chapter_outline` matches headers via the regex
  `### Ch N:` — outline.md chapter headers MUST use that exact form.
- The drafting loop is `range(chapters_drafted+1, total+1)` over `ch_{n:02d}.md`;
  the Prologue (ch_00) sits outside it as front matter.
- `run_pipeline --from-scratch` / `--phase foundation` will regenerate and
  overwrite the hand-authored foundation. Start at drafting or revision instead.

## Do-Not-Repeat
- Don't point draft_chapter.py at the fantasy book ("Second Son of the House of
  Bells") — it's been retargeted to "Digital Insurgency".
- Don't render REAPER as a character/body/speech-bubble — it's an environment.
- Don't let any chapter "defeat/destroy" PRISM/REAPER (violates Claim 4).
- Don't punch down at workers; only up at the system.
