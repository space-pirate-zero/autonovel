"""Command-line entry point for the publishing pipeline (no MCP needed).

Examples:
  uv run python publishing/cli.py shows
  uv run python publishing/cli.py publish neko-death-cult --dry-run
  uv run python publishing/cli.py add neko-death-cult 1
  uv run python publishing/cli.py feed neko-death-cult --dry-run
  uv run python publishing/cli.py episodes neko-death-cult
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from core import config as cfg  # noqa: E402
from core import publisher  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(prog="publishing")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("shows", help="list configured shows")

    sp = sub.add_parser("episodes", help="list manifest episodes")
    sp.add_argument("show")

    sp = sub.add_parser("add", help="publish one episode")
    sp.add_argument("show")
    sp.add_argument("n", type=int)
    sp.add_argument("--dry-run", action="store_true")

    sp = sub.add_parser("publish", help="backfill all episodes with audio")
    sp.add_argument("show")
    sp.add_argument("--dry-run", action="store_true")

    sp = sub.add_parser("feed", help="rebuild the feed")
    sp.add_argument("show")
    sp.add_argument("--dry-run", action="store_true")

    sp = sub.add_parser("cover", help="upload cover art")
    sp.add_argument("show")
    sp.add_argument("--dry-run", action="store_true")

    a = p.parse_args()
    if a.cmd == "shows":
        out = cfg.list_shows()
    elif a.cmd == "episodes":
        out = publisher.list_episodes(a.show)
    elif a.cmd == "add":
        out = publisher.add_episode(a.show, a.n, dry_run=a.dry_run)
    elif a.cmd == "publish":
        out = publisher.publish_book(a.show, dry_run=a.dry_run)
    elif a.cmd == "feed":
        out = publisher.rebuild_feed(a.show, dry_run=a.dry_run)
    elif a.cmd == "cover":
        out = publisher.publish_cover(a.show, dry_run=a.dry_run)
    else:  # pragma: no cover
        return 2

    print(json.dumps(out, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
