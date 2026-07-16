"""Shared stats-collection logic used by both the analytics MCP server and the
dashboard's refresh endpoint. Pulls Substack (+ Apple if configured) + the manifest
episode list into SQLite. Never hard-fails on a single source (the unofficial
Substack API in particular).
"""
from __future__ import annotations

import json

from analytics import apple
from core import config as cfg
from core import db
from core import manifest as mani


def refresh(slug: str) -> dict:
    show = cfg.get_show(slug)
    notes: list[str] = []
    with db.connect() as conn:
        db.upsert_show(conn, slug, show["title"])

        manifest = mani.load(slug)
        for ep in mani.episodes_sorted(manifest):
            db.upsert_episode_stats(
                conn, slug, ep["guid"], ep["n"], ep["title"], platform="gcs"
            )

        try:
            from core import substack_client as sub

            s = sub.get_stats(slug=slug)
            db.upsert_show_stats(
                conn, slug, "substack",
                subscribers=s.get("subscriber_count"),
                extra_json=json.dumps(s.get("recent_posts", [])),
            )
            notes.append(f"substack: {s.get('subscriber_count')} subscribers")
        except Exception as e:
            notes.append(f"substack skipped: {e}")

        apple_id = show.get("apple_show_id")
        if apple.available() and apple_id:
            try:
                raw = apple.get_show_trends(str(apple_id))
                db.upsert_show_stats(conn, slug, "apple", extra_json=json.dumps(raw)[:100000])
                notes.append("apple: raw trends stored")
            except Exception as e:
                notes.append(f"apple skipped: {e}")
        else:
            notes.append("apple skipped: not configured / no apple_show_id in config")

    return {"show": slug, "date": db.today(), "notes": notes}
