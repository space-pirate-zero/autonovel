"""High-level publish operations, independent of the MCP transport.

These functions are the actual pipeline; publish_server.py just exposes them as
MCP tools, and cli.py exposes them on the command line. `dry_run=True` builds and
writes the feed locally under publishing/.state/ WITHOUT touching GCS, so the whole
thing is verifiable offline before any credentials or buckets exist.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from . import config as cfg
from . import feed as feedmod
from . import gcs
from . import manifest as mani


def _ep_cfg(show: dict, n: int) -> dict:
    for e in show["episodes"]:
        if e["n"] == n:
            return e
    raise KeyError(f"Episode {n} is not defined in config for show '{show['slug']}'")


def _write_local_feed(slug: str, feed_xml: bytes) -> Path:
    cfg.STATE_DIR.mkdir(parents=True, exist_ok=True)
    p = cfg.STATE_DIR / f"{slug}.feed.xml"
    p.write_bytes(feed_xml)
    return p


def rebuild_feed(slug: str, dry_run: bool = False) -> dict[str, Any]:
    """Rebuild feed.xml from the manifest and (unless dry_run) upload it."""
    show = cfg.get_show(slug)
    manifest = mani.load(slug)
    feed_xml = feedmod.build_feed(show, manifest)
    local = _write_local_feed(slug, feed_xml)
    result = {
        "show": slug,
        "episodes": len(manifest["episodes"]),
        "local_feed": str(local),
        "feed_url": show["feed_url"],
        "dry_run": dry_run,
    }
    if not dry_run:
        result["uploaded_feed"] = gcs.upload_feed(show, feed_xml)
        # Mirror the manifest to GCS as a backup / audit trail.
        import json

        gcs.upload_bytes(
            show["_bucket"],
            json.dumps(manifest, indent=2, sort_keys=True).encode(),
            f"{show['gcs_prefix']}/manifest.json",
            "application/json",
            "no-cache",
        )
    return result


def add_episode(slug: str, n: int, dry_run: bool = False) -> dict[str, Any]:
    """Register episode n, upload its audio (unless dry_run), and rebuild the feed."""
    show = cfg.get_show(slug)
    manifest = mani.load(slug)
    ep = mani.upsert_episode(show, manifest, _ep_cfg(show, n))
    mani.save(slug, manifest)

    result: dict[str, Any] = {
        "show": slug,
        "episode": n,
        "title": ep["title"],
        "guid": ep["guid"],
        "pubdate": ep["pubdate"],
        "duration_s": ep["duration"],
        "size_bytes": ep["size"],
        "audio_url": ep["audio_url"],
        "dry_run": dry_run,
    }
    if not dry_run:
        result["uploaded_audio"] = gcs.upload_audio(show, n, ep["audio_local"])

    result.update({"feed": rebuild_feed(slug, dry_run=dry_run)})
    return result


def publish_book(slug: str, dry_run: bool = False) -> dict[str, Any]:
    """Publish every configured episode whose audio exists on disk (backfill)."""
    show = cfg.get_show(slug)
    done, skipped = [], []
    for e in show["episodes"]:
        n = e["n"]
        if cfg.audio_path_for(show, n).exists():
            add_episode(slug, n, dry_run=dry_run)
            done.append(n)
        else:
            skipped.append(n)
    return {
        "show": slug,
        "published": done,
        "skipped_missing_audio": skipped,
        "feed_url": show["feed_url"],
        "dry_run": dry_run,
    }


def list_episodes(slug: str) -> dict[str, Any]:
    manifest = mani.load(slug)
    return {
        "show": slug,
        "count": len(manifest["episodes"]),
        "episodes": [
            {k: e[k] for k in ("n", "title", "pubdate", "duration", "audio_url")}
            for e in mani.episodes_sorted(manifest)
        ],
    }


def publish_cover(slug: str, dry_run: bool = False) -> dict[str, Any]:
    show = cfg.get_show(slug)
    cover = show["_cover_path"]
    if not cover.exists():
        raise FileNotFoundError(
            f"Cover art not found at {cover}. Apple requires a 3000x3000 JPG/PNG."
        )
    result = {"show": slug, "cover_local": str(cover), "cover_url": show["cover_url"]}
    if not dry_run:
        result["uploaded_cover"] = gcs.upload_cover(show, cover)
    return result
