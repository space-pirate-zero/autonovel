"""Autopilot tick entrypoint for schedulers (launchd / cron).

    python -m spz_brand_machine.tick

Runs one no-touch cycle and prints the result as JSON. Honors the kill switch and
dry-run flag. Safe to schedule: in dry-run it generates + logs intended actions
without touching live accounts. Append-only run history goes to tick_runs.jsonl.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone

from .config import PROJECT_DIR
from .orchestrator import autopilot_tick


def main() -> int:
    try:
        result = autopilot_tick()
        ok = True
    except Exception as exc:
        result = {"error": str(exc), "type": type(exc).__name__}
        ok = False
    result.setdefault("ran_at", datetime.now(timezone.utc).isoformat())
    line = json.dumps(result, default=str)
    try:
        with (PROJECT_DIR / "tick_runs.jsonl").open("a", encoding="utf-8") as fh:
            fh.write(line + "\n")
    except OSError:
        pass
    print(line)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
