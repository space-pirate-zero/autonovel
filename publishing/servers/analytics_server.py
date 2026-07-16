"""FastMCP server: refresh + read analytics for the dashboard.

Tools:
  refresh_stats(show)   -> pull Substack (+ Apple if configured) into SQLite
  get_overview()        -> latest per-show snapshot across platforms
  get_book_stats(show)  -> per-episode + time-series for one show

Run: uv run python publishing/servers/analytics_server.py
"""
from __future__ import annotations

import sys
from pathlib import Path

PUBLISHING_DIR = Path(__file__).resolve().parents[1]
if str(PUBLISHING_DIR) not in sys.path:
    sys.path.insert(0, str(PUBLISHING_DIR))

from mcp.server.fastmcp import FastMCP  # noqa: E402

from analytics import collect  # noqa: E402
from core import db  # noqa: E402

mcp = FastMCP("sa9-analytics")


@mcp.tool()
def refresh_stats(show: str) -> dict:
    """Pull latest Substack (+ Apple if configured) stats into the local SQLite store."""
    return collect.refresh(show)


@mcp.tool()
def get_overview() -> list[dict]:
    """Latest per-show snapshot across platforms (for the dashboard homepage)."""
    with db.connect() as conn:
        return db.overview(conn)


@mcp.tool()
def get_book_stats(show: str) -> dict:
    """Per-episode stats + time-series for one show."""
    with db.connect() as conn:
        return db.show_detail(conn, show)


if __name__ == "__main__":
    mcp.run()
