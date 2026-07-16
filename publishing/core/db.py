"""SQLite analytics store for the dashboard.

One file at publishing/.state/analytics.sqlite. Two snapshot tables keyed by date
so we keep a daily time-series (subscribers/followers/downloads over time) rather
than only the latest number. `refresh_stats` (analytics_server) upserts today's row.
"""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import date
from pathlib import Path

from . import config as cfg

DB_PATH = cfg.STATE_DIR / "analytics.sqlite"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS shows (
    slug  TEXT PRIMARY KEY,
    title TEXT
);
CREATE TABLE IF NOT EXISTS show_stats (
    slug     TEXT,
    platform TEXT,               -- substack | apple | spotify | gcs
    date     TEXT,               -- YYYY-MM-DD
    subscribers INTEGER,
    followers   INTEGER,
    downloads   INTEGER,
    extra_json  TEXT,
    PRIMARY KEY (slug, platform, date)
);
CREATE TABLE IF NOT EXISTS episode_stats (
    slug     TEXT,
    guid     TEXT,
    n        INTEGER,
    title    TEXT,
    platform TEXT,
    date     TEXT,
    downloads INTEGER,
    plays     INTEGER,
    PRIMARY KEY (slug, guid, platform, date)
);
"""


@contextmanager
def connect():
    cfg.STATE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        conn.executescript(_SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def today() -> str:
    return date.today().isoformat()


def upsert_show(conn, slug: str, title: str) -> None:
    conn.execute(
        "INSERT INTO shows(slug,title) VALUES(?,?) "
        "ON CONFLICT(slug) DO UPDATE SET title=excluded.title",
        (slug, title),
    )


def upsert_show_stats(conn, slug: str, platform: str, *, subscribers=None,
                      followers=None, downloads=None, extra_json=None,
                      on_date: str | None = None) -> None:
    conn.execute(
        """INSERT INTO show_stats(slug,platform,date,subscribers,followers,downloads,extra_json)
           VALUES(?,?,?,?,?,?,?)
           ON CONFLICT(slug,platform,date) DO UPDATE SET
             subscribers=COALESCE(excluded.subscribers,show_stats.subscribers),
             followers  =COALESCE(excluded.followers,  show_stats.followers),
             downloads  =COALESCE(excluded.downloads,  show_stats.downloads),
             extra_json =COALESCE(excluded.extra_json, show_stats.extra_json)""",
        (slug, platform, on_date or today(), subscribers, followers, downloads, extra_json),
    )


def upsert_episode_stats(conn, slug: str, guid: str, n: int, title: str,
                         platform: str, *, downloads=None, plays=None,
                         on_date: str | None = None) -> None:
    conn.execute(
        """INSERT INTO episode_stats(slug,guid,n,title,platform,date,downloads,plays)
           VALUES(?,?,?,?,?,?,?,?)
           ON CONFLICT(slug,guid,platform,date) DO UPDATE SET
             downloads=COALESCE(excluded.downloads,episode_stats.downloads),
             plays    =COALESCE(excluded.plays,    episode_stats.plays)""",
        (slug, guid, n, title, platform, on_date or today(), downloads, plays),
    )


# ---- read helpers for the dashboard ----

def overview(conn) -> list[dict]:
    """Latest per-show snapshot across platforms."""
    rows = conn.execute(
        """SELECT s.slug, s.title,
                  (SELECT subscribers FROM show_stats
                     WHERE slug=s.slug AND platform='substack'
                     ORDER BY date DESC LIMIT 1) AS subscribers,
                  (SELECT followers FROM show_stats
                     WHERE slug=s.slug AND platform='apple'
                     ORDER BY date DESC LIMIT 1) AS apple_followers,
                  (SELECT SUM(downloads) FROM show_stats
                     WHERE slug=s.slug AND date=(SELECT MAX(date) FROM show_stats WHERE slug=s.slug)
                  ) AS downloads
             FROM shows s ORDER BY s.title""",
    ).fetchall()
    return [dict(r) for r in rows]


def show_detail(conn, slug: str) -> dict:
    eps = conn.execute(
        """SELECT n, title, platform, MAX(date) AS date, downloads, plays
             FROM episode_stats WHERE slug=? GROUP BY guid, platform
             ORDER BY n""",
        (slug,),
    ).fetchall()
    series = conn.execute(
        """SELECT date, platform, subscribers, followers, downloads
             FROM show_stats WHERE slug=? ORDER BY date""",
        (slug,),
    ).fetchall()
    return {
        "slug": slug,
        "episodes": [dict(r) for r in eps],
        "series": [dict(r) for r in series],
    }
