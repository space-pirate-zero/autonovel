# spz-brand-machine — bytecode recovery archive

**What this is:** the only surviving copy of the `spz-brand-machine` service.
The Python source (`*.py`) was deleted from
`/Users/gregchambers/autonovel/spz-brand-machine/` sometime after 2026-06-24;
these `.pyc` files (CPython 3.12, compiled 2026-06-20) from its `__pycache__`
are all that remains. Committed here 2026-07-15 so the loss can't get worse.

**What the service was** (from module names + launchd logs): a brand
automation daemon — `orchestrator`, `tick` (scheduled entrypoint),
`brand_voice`, `safety`, `llm`, `config`, `login`, `server`, plus connectors
for `substack` (+ `substack_endpoints`), `meta`, and `browser` /
`playwright_session`. It ran as launchd agent
`~/Library/LaunchAgents/com.spacepiratezero.brandmachine.plist` via
`/Users/gregchambers/autonovel/.venv/bin/python -m spz_brand_machine.tick`.

**⚠ The launchd agent is still registered and failing** on every tick with
`No module named spz_brand_machine.tick` (see the old `launchd.err.log`).
Either restore the module or `launchctl bootout gui/$UID
~/Library/LaunchAgents/com.spacepiratezero.brandmachine.plist`.

**To recover source:** CPython 3.12 decompilation is imperfect but viable —
try `pycdc` (Decompyle++) per module; `python3.12 -m dis <file>.pyc` always
works for reading logic. The intact venv at the original path lists the
dependency set (httpx, playwright, …). Rebuild into a proper package with
tests before re-enabling the launchd agent.
