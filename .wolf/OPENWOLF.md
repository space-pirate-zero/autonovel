# OPENWOLF — session protocol for this repo

This file is loaded via `CLAUDE.md` every session. It defines the working
protocol for AI agents (and humans) in the Spaceship Alpha 9 studio repo.

## Every session, in order

1. **Orient** — read `.wolf/anatomy.md` (repo map) BEFORE opening project
   files, and `.wolf/cerebrum.md` (preferences / learnings / Do-Not-Repeat)
   BEFORE generating code or prose.
2. **Rules** — `RULES.md` at repo root binds all output. Brand gate:
   `brand/spz/ENFORCEMENT.md`. Canon gate: `UNIVERSE.md`.
3. **Bugs** — before fixing any bug/error, check `.wolf/buglog.json` for a
   known fix.

## During work

- New convention, preference, or pattern discovered → add to
  `.wolf/cerebrum.md` (low threshold; when in doubt, log it).
- User correction received → update `.wolf/cerebrum.md` immediately.
- Editing the same file 3+ times in a session → probably a bug; log it.

## After work

- Fixed a bug / failed test / failed build / user-reported problem → append to
  `.wolf/buglog.json` with `error_message`, `root_cause`, `fix`, `tags`.
- Wrote or edited files → update `.wolf/anatomy.md` if the map changed, and
  append a session entry to `.wolf/memory.md` (date, what, where, state).
- Opened/landed a long-running branch → update `docs/BRANCHES.md`.

## The .wolf files

| File | Role |
|---|---|
| `anatomy.md` | current map of the repo — keep it true |
| `cerebrum.md` | preferences, learnings, Do-Not-Repeat |
| `memory.md` | append-only session log (project history) |
| `buglog.json` | known bugs + fixes (check before, log after) |
