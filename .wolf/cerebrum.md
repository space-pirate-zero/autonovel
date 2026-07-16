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

- This is THE studio repo (books+podcasts+socials+marketing+web). Studio docs:
  README → docs/{CATALOG,OPERATIONS,INFRASTRUCTURE,BRANCHES} → RULES.md.
  Check docs/BRANCHES.md before assuming work is missing from master —
  live work sits on spz/* worktree branches (sometimes UNCOMMITTED, like
  asset-mcp was).
- `books/zero-trust-reality/` on master = stale byte-clone of the-last-human-ceo;
  real book (*Defense Against the Dark Arts*) is on
  spz/zero-trust-research-analysis-24ce8e. Merge before touching that folder.
- asset-mcp/ is the studio's main MCP endpoint (find + generate on-brand
  assets). Prefer generate_asset over raw image prompts for social art.
- Brand gate for ANY public artifact: brand/spz/ENFORCEMENT.md (5 hexes only,
  3 fonts, banned words, −16 LUFS, punch up never down).
- ONE spaceship: the canonical SA9 saucer (UNIVERSE.md §1a / RULES.md §3.5) —
  dome cockpit w/ empty seats, pink circuit-grid hull, "SPACESHIP ALPHA 9"
  nameplate, red beacon, teal tractor beam. Never redesign it; vary only the
  scene under the beam.
- Repo boundary: studio content NEVER goes in the SpaceShipAlpha9 repo — that
  repo is product/company site code only (RULES.md §8.0).

## Do-Not-Repeat
- Don't point draft_chapter.py at the fantasy book ("Second Son of the House of
  Bells") — it's been retargeted to "Digital Insurgency".
- Don't render REAPER as a character/body/speech-bubble — it's an environment.
- Don't let any chapter "defeat/destroy" PRISM/REAPER (violates Claim 4).
- Don't punch down at workers; only up at the system.
