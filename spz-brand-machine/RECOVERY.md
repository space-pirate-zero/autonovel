# Provenance — reconstructed source

The original `*.py` source of this package was deleted from
`/Users/gregchambers/autonovel/spz-brand-machine/` sometime after 2026-06-24.
The only surviving artifacts were the CPython 3.12 `.pyc` files from its
`__pycache__` (compiled 2026-06-20), archived at `recovery/spz-brand-machine/`
in this repo, plus the wheel metadata of the editable install left in the old
`.venv` (which preserved `README.md`, the dependency set, extras, and console
scripts verbatim).

This tree was reconstructed 2026-07-15 by decompiling each module (Decompyle++
plus manual reconstruction from `python3.12 -m dis` output). Every module was
verified against the original bytecode with a recursive opcode-stream
comparison (line numbers ignored); deviations, if any, are listed below.

What could NOT be recovered because it never lived in the bytecode:

- comments and blank-line layout (docstrings and all string constants are
  exact),
- `SPZ_BRAND_MACHINE.md` (the architecture doc referenced by the README),
- the original `.env.example` (recreated here from the documented settings),
- `content_plan.json` operational data.

## Verification status

All 15 modules verify **MATCH**: the recursive opcode stream of each
reconstructed file, compiled under CPython 3.12, is identical to the recovered
`.pyc` (line numbers ignored; docstrings, constants, and signatures exact).
A fresh `pip install -e .` imports every module and all three console scripts
(`spz-brand-machine`, `spz-login`, `spz-tick`) cleanly.

## Known latent issues (present in the original service)

The tree below is frozen to preserve byte-equivalence with the recovered
bytecode, so bugs that existed in the original service are documented here
rather than patched. Fix these in a follow-up change that consciously breaks
byte-equivalence (updating this file when it does):

1. **README vs code — cookie auto-refresh doesn't rewrite `.env`.** The
   README's cookie-rotation section says a 401/403 pulls fresh cookies "and
   rewrites them into `.env`"; in code, `substack.py:_try_refresh` only sets
   an in-memory override for the current process. Only `spz-login` writes
   `.env`, so cookies in `.env` go stale across processes by design.
2. **Undocumented `VERIFIED` endpoint tag.** `substack_endpoints.py` uses
   STABLE / VERIFY / VERIFIED / NONE; the README documents only STABLE/VERIFY.
   `VERIFIED` behaves like STABLE (no warning on use).
3. **Settings are frozen at import.** `config.settings` is a module-level
   singleton, so flipping `SPZ_KILL_SWITCH` / `SPZ_AUTOPILOT_DRY_RUN` in
   `.env` does not affect an already-running MCP server — restart it. (The
   launchd tick is a fresh process per run, so it always sees current values.)
4. **Rate limits are per-process, not global.** The safety layer's hourly
   caps live in process memory; the MCP server, a scheduled tick, and any
   restart each get an independent budget, and the slot is recorded only
   after the action executes (two concurrent calls can both pass at limit−1).
5. **Pricing guard gaps.** `founding` price is never validated, and the
   max-single-step-delta check only runs when the caller supplies current
   prices. Mitigated by #6: pricing never auto-executes.
6. **Browser fallback never auto-clicks.** `SubstackConnector` hardcodes
   `BrowserFallback(backend="manual")`, so `update_bio`/`set_pricing` emit
   operator instructions instead of performing the change — while `guard()`
   still audits `ok` and consumes a rate slot. The Playwright backend is
   effectively dead code. Check `detail` for "manual: steps emitted".
7. **`connect.sid` lost on auto-refresh.** The Playwright cookie harvest
   collects sid/lli/cf_clearance but not `connect.sid`, and the in-memory
   override replaces the whole jar — Notes posting can 401 right after a
   "successful" refresh.
8. **Scheduling compares ISO strings lexicographically.** Non-UTC offsets in
   `content_plan.json` `scheduled_for` values compare as wall-clock; use
   `+00:00` timestamps only.
9. **Duplicate-post risk on plan write failure.** If rewriting
   `content_plan.json` fails after a live publish (`except OSError: pass`),
   the same item republishes on every later tick.
10. Assorted minor issues: Meta page token sent as a URL query param on GETs;
    `spz_substack_update_bio` doesn't validate its `field` argument;
    `origin`/`referer` headers use the publication URL even on
    `substack.com`-global endpoints; a fresh connector per tool call can
    relaunch headless Chromium repeatedly when cookies are dead; the
    python-substack layer doesn't null-check the draft id; the LLM brand gate
    judges text included verbatim in its prompt (prompt-injectable content
    could clear the gate).

## launchd agent

`com.spacepiratezero.brandmachine` was failing every scheduled tick after the
source deletion (`No module named spz_brand_machine.tick`) and was **unloaded
on 2026-07-15**. The plist is archived at `deploy/` and still present in
`~/Library/LaunchAgents/`. To re-enable after this tree is merged and
installed into the repo venv (do not re-enable live posting without an
explicit decision — dry-run stays on until `SPZ_AUTOPILOT_DRY_RUN=false`):

```bash
cd spz-brand-machine && /Users/gregchambers/autonovel/.venv/bin/pip install -e .
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.spacepiratezero.brandmachine.plist
```
