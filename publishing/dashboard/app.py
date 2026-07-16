"""Local dashboard: how the books/podcasts are doing.

Run: uv run uvicorn publishing.dashboard.app:app --reload --port 8777
     (or: uv run python publishing/dashboard/app.py)
Then open http://localhost:8777

Reads the SQLite analytics store + the publish manifests, so it shows your
published episodes even before any stats have been pulled. "Refresh" buttons call
the same collector the analytics MCP server uses.
"""
from __future__ import annotations

import sys
from pathlib import Path

PUBLISHING_DIR = Path(__file__).resolve().parents[1]
if str(PUBLISHING_DIR) not in sys.path:
    sys.path.insert(0, str(PUBLISHING_DIR))

from fastapi import FastAPI  # noqa: E402
from fastapi.responses import FileResponse, JSONResponse  # noqa: E402

from analytics import collect  # noqa: E402
from core import config as cfg  # noqa: E402
from core import db  # noqa: E402
from core import manifest as mani  # noqa: E402

app = FastAPI(title="SA9 Publishing Dashboard")
STATIC = Path(__file__).resolve().parent / "static"


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC / "index.html")


@app.get("/api/overview")
def api_overview() -> JSONResponse:
    """Per-show cards: merges config + manifest (episodes/minutes) + SQLite stats."""
    with db.connect() as conn:
        stats = {r["slug"]: r for r in db.overview(conn)}
    cards = []
    for slug in cfg.list_shows():
        show = cfg.get_show(slug)
        m = mani.load(slug)
        eps = mani.episodes_sorted(m)
        total_secs = sum(e.get("duration", 0) for e in eps)
        s = stats.get(slug, {})
        cards.append({
            "slug": slug,
            "title": show["title"],
            "episodes_published": len(eps),
            "total_minutes": round(total_secs / 60),
            "feed_url": show["feed_url"],
            "subscribers": s.get("subscribers"),
            "apple_followers": s.get("apple_followers"),
            "downloads": s.get("downloads"),
        })
    return JSONResponse(cards)


@app.get("/api/show/{slug}")
def api_show(slug: str) -> JSONResponse:
    show = cfg.get_show(slug)
    m = mani.load(slug)
    with db.connect() as conn:
        detail = db.show_detail(conn, slug)
    # Downloads keyed by episode n, from whatever platforms have data.
    dl = {}
    for row in detail["episodes"]:
        dl.setdefault(row["n"], 0)
        dl[row["n"]] += row.get("downloads") or 0
    episodes = [
        {
            "n": e["n"],
            "title": e["title"],
            "pubdate": e["pubdate"],
            "minutes": round(e.get("duration", 0) / 60, 1),
            "audio_url": e["audio_url"],
            "downloads": dl.get(e["n"]),
        }
        for e in mani.episodes_sorted(m)
    ]
    return JSONResponse({
        "slug": slug,
        "title": show["title"],
        "feed_url": show["feed_url"],
        "episodes": episodes,
        "series": detail["series"],
    })


@app.post("/api/refresh/{slug}")
def api_refresh(slug: str) -> JSONResponse:
    return JSONResponse(collect.refresh(slug))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8777)
