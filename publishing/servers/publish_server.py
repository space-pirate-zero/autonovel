"""FastMCP server: publish SA9 shows to the self-hosted GCS feed.

Tools:
  list_shows()                         -> configured shows
  list_episodes(show)                  -> episodes already in the manifest
  add_episode(show, n, dry_run=False)  -> upload one episode + rebuild feed
  publish_book(show, dry_run=False)    -> backfill every episode with audio on disk
  rebuild_feed(show, dry_run=False)    -> regenerate feed.xml from the manifest
  publish_cover(show, dry_run=False)   -> upload the show artwork

Run: uv run python publishing/servers/publish_server.py
"""
from __future__ import annotations

import sys
from pathlib import Path

# Make `core` importable whether launched as a script or a module.
PUBLISHING_DIR = Path(__file__).resolve().parents[1]
if str(PUBLISHING_DIR) not in sys.path:
    sys.path.insert(0, str(PUBLISHING_DIR))

from mcp.server.fastmcp import FastMCP  # noqa: E402

from core import config as cfg  # noqa: E402
from core import publisher  # noqa: E402

mcp = FastMCP("sa9-publish")


@mcp.tool()
def list_shows() -> list[str]:
    """List configured shows (slugs) from publishing/config.yaml."""
    return cfg.list_shows()


@mcp.tool()
def list_episodes(show: str) -> dict:
    """List episodes currently in the manifest for a show."""
    return publisher.list_episodes(show)


@mcp.tool()
def add_episode(show: str, n: int, dry_run: bool = False) -> dict:
    """Publish a single episode: upload its mp3 to GCS and rebuild the feed.

    dry_run=True builds the feed locally under publishing/.state/ without touching GCS.
    """
    return publisher.add_episode(show, n, dry_run=dry_run)


@mcp.tool()
def publish_book(show: str, dry_run: bool = False) -> dict:
    """Publish every configured episode whose audio exists on disk (backfill)."""
    return publisher.publish_book(show, dry_run=dry_run)


@mcp.tool()
def rebuild_feed(show: str, dry_run: bool = False) -> dict:
    """Regenerate feed.xml from the manifest and upload it (unless dry_run)."""
    return publisher.rebuild_feed(show, dry_run=dry_run)


@mcp.tool()
def publish_cover(show: str, dry_run: bool = False) -> dict:
    """Upload the show's cover art (must be 3000x3000 for Apple)."""
    return publisher.publish_cover(show, dry_run=dry_run)


if __name__ == "__main__":
    mcp.run()
