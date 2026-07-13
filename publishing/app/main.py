#!/usr/bin/env python3
"""
Cloud Run service for The Last Human CEO — marketing site + podcast RSS.

  GET /              the marketing site (server-rendered index.html, plays episodes)
  GET /feed.xml      the podcast RSS (GET + HEAD — Apple's iTMS crawler HEADs it)
  GET /sitemap.xml   sitemap    GET /robots.txt   robots
  GET /static/*      static assets (og image)
  GET /feed,/rss     -> /feed.xml     GET /health   liveness

All page/feed/asset files are baked into the container at deploy time by
gen_site.py / gen_feed.py. Audio + episode art live in public GCS.
"""
from pathlib import Path
from fastapi import FastAPI, Response
from fastapi.responses import RedirectResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

HERE = Path(__file__).resolve().parent
app = FastAPI(title="The Last Human CEO")

if (HERE / "static").is_dir():
    app.mount("/static", StaticFiles(directory=str(HERE / "static")), name="static")


def _file(name, media):
    p = HERE / name
    if not p.exists():
        return Response(f"{name} not built", status_code=503)
    return FileResponse(str(p), media_type=media)


@app.get("/health")
def health():
    return {"ok": True, "site": (HERE / "index.html").exists(), "feed": (HERE / "feed.xml").exists()}


@app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
def home():
    p = HERE / "index.html"
    if not p.exists():
        return HTMLResponse("<h1>Site not built.</h1>", status_code=503)
    return HTMLResponse(p.read_text())


@app.api_route("/feed.xml", methods=["GET", "HEAD"])
def feed():
    return _file("feed.xml", "application/rss+xml; charset=utf-8")


@app.api_route("/about", methods=["GET", "HEAD"], response_class=HTMLResponse)
def about():
    p = HERE / "about.html"
    if not p.exists():
        return HTMLResponse("<h1>Not built.</h1>", status_code=503)
    return HTMLResponse(p.read_text())


@app.api_route("/press", methods=["GET", "HEAD"], response_class=HTMLResponse)
def press():
    p = HERE / "press.html"
    if not p.exists():
        return HTMLResponse("<h1>Not built.</h1>", status_code=503)
    return HTMLResponse(p.read_text())


@app.get("/sitemap.xml")
def sitemap():
    return _file("sitemap.xml", "application/xml")


@app.get("/robots.txt")
def robots():
    return _file("robots.txt", "text/plain")


@app.get("/feed")
@app.get("/rss")
def feed_alias():
    return RedirectResponse(url="/feed.xml")


# The cover lives on public GCS; redirect the pretty-domain path to it so
# lasthumanceo.com/cover.jpg resolves (used by favicons, scrapers, share cards).
@app.api_route("/cover.jpg", methods=["GET", "HEAD"])
def cover():
    return RedirectResponse(
        url="https://storage.googleapis.com/spz-podcasts/the-last-human-ceo/cover.jpg",
        status_code=302,
    )
