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
