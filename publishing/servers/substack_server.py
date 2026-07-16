"""FastMCP server: publish to Substack (unofficial API).

Tools:
  substack_create_draft(title, subtitle, body_markdown, show?, audience?)
  substack_publish_post(title, subtitle, body_markdown, show?, audience?)
  substack_stats(show?, limit?)

Run: uv run python publishing/servers/substack_server.py
Needs Substack creds in .env — see core/substack_client.py.
"""
from __future__ import annotations

import sys
from pathlib import Path

PUBLISHING_DIR = Path(__file__).resolve().parents[1]
if str(PUBLISHING_DIR) not in sys.path:
    sys.path.insert(0, str(PUBLISHING_DIR))

from mcp.server.fastmcp import FastMCP  # noqa: E402

from core import substack_client as sub  # noqa: E402

mcp = FastMCP("sa9-substack")


@mcp.tool()
def substack_create_draft(title: str, subtitle: str, body_markdown: str,
                          show: str | None = None, audience: str = "everyone") -> dict:
    """Create a Substack draft (not published). audience: everyone | only_paid | founding."""
    return sub.create_draft(title, subtitle, body_markdown, slug=show, audience=audience)


@mcp.tool()
def substack_publish_post(title: str, subtitle: str, body_markdown: str,
                          show: str | None = None, audience: str = "everyone") -> dict:
    """Create AND publish a Substack post."""
    return sub.publish_post(title, subtitle, body_markdown, slug=show, audience=audience)


@mcp.tool()
def substack_stats(show: str | None = None, limit: int = 10) -> dict:
    """Subscriber count + recent posts for the show's publication."""
    return sub.get_stats(slug=show, limit=limit)


if __name__ == "__main__":
    mcp.run()
