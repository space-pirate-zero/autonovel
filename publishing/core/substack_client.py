"""Substack via the unofficial `python-substack` (publish) — risk accepted.

No official API exists; this wraps ma2za/python-substack. If Substack changes
their site these calls can break, at which point Substack degrades to draft-only
and the podcast pipeline is unaffected.

Auth (in repo-root .env), in order of preference:
  SUBSTACK_COOKIES_PATH=/abs/path/to/substack_cookies.json   (from api.export_cookies())
  SUBSTACK_EMAIL=... + SUBSTACK_PASSWORD=...
Publication URL comes from the show's `substack_url` in config.yaml, or
SUBSTACK_PUBLICATION_URL in .env.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from substack import Api
from substack.post import Post

from . import config as cfg

load_dotenv(cfg.REPO_ROOT / ".env")


def _resolve_publication_url(slug: str | None) -> str:
    if slug:
        url = cfg.get_show(slug).get("substack_url")
        if url:
            return url
    url = os.getenv("SUBSTACK_PUBLICATION_URL")
    if not url:
        raise RuntimeError(
            "No Substack publication URL. Set `substack_url` for the show in "
            "config.yaml, or SUBSTACK_PUBLICATION_URL in .env."
        )
    return url


def get_api(slug: str | None = None) -> Api:
    pub = _resolve_publication_url(slug)
    cookies = os.getenv("SUBSTACK_COOKIES_PATH")
    if cookies and Path(cookies).exists():
        return Api(cookies_path=cookies, publication_url=pub)
    email, password = os.getenv("SUBSTACK_EMAIL"), os.getenv("SUBSTACK_PASSWORD")
    if email and password:
        return Api(email=email, password=password, publication_url=pub)
    raise RuntimeError(
        "No Substack credentials. Set SUBSTACK_COOKIES_PATH, or "
        "SUBSTACK_EMAIL + SUBSTACK_PASSWORD, in .env."
    )


def _build_post(api: Api, title: str, subtitle: str, body_markdown: str,
                audience: str) -> Post:
    post = Post(title=title, subtitle=subtitle, user_id=api.get_user_id(),
                audience=audience)
    post.from_markdown(body_markdown)
    return post


def create_draft(title: str, subtitle: str, body_markdown: str,
                 slug: str | None = None, audience: str = "everyone") -> dict[str, Any]:
    """Create (but do not publish) a Substack draft. Returns the draft id + edit URL."""
    api = get_api(slug)
    draft = api.post_draft(_build_post(api, title, subtitle, body_markdown, audience).get_draft())
    return {
        "draft_id": draft.get("id"),
        "title": title,
        "edit_url": f"{_resolve_publication_url(slug)}/publish/post/{draft.get('id')}",
        "published": False,
    }


def publish_post(title: str, subtitle: str, body_markdown: str,
                 slug: str | None = None, audience: str = "everyone") -> dict[str, Any]:
    """Create a draft and publish it immediately."""
    api = get_api(slug)
    draft = api.post_draft(_build_post(api, title, subtitle, body_markdown, audience).get_draft())
    draft_id = draft.get("id")
    api.prepublish_draft(draft_id)
    published = api.publish_draft(draft_id)
    return {
        "draft_id": draft_id,
        "title": title,
        "published": True,
        "url": published.get("canonical_url") if isinstance(published, dict) else None,
    }


def get_stats(slug: str | None = None, limit: int = 10) -> dict[str, Any]:
    """Subscriber count + recent published posts (for the dashboard)."""
    api = get_api(slug)
    try:
        subs = api.get_publication_subscriber_count()
    except Exception as e:  # unofficial API — never hard-fail stats
        subs = None
        _ = e
    posts = api.get_published_posts(limit=limit) if hasattr(api, "get_published_posts") else []
    return {
        "publication_url": _resolve_publication_url(slug),
        "subscriber_count": subs,
        "recent_posts": [
            {
                "title": p.get("title"),
                "post_date": p.get("post_date"),
                "url": p.get("canonical_url"),
                "reactions": p.get("reaction_count") or (p.get("reactions") or {}).get("❤"),
            }
            for p in (posts or [])
        ],
    }
