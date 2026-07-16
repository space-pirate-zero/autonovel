"""Per-show episode manifest — the source of truth for what's published.

The manifest is a JSON file kept locally under publishing/.state/<slug>.manifest.json
and mirrored to GCS at <prefix>/manifest.json. Each episode records the immutable
facts a feed needs (guid, pubdate, byte size, duration) so that rebuilding the feed
is deterministic and re-runs never shuffle dates or GUIDs.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from mutagen.mp3 import MP3

from . import config as cfg

# Stable namespace so a given (show, episode) always hashes to the same GUID.
_GUID_NS = uuid.UUID("6f9619ff-8b86-d011-b42d-00c04fc964ff")


def _manifest_path(slug: str) -> Path:
    cfg.STATE_DIR.mkdir(parents=True, exist_ok=True)
    return cfg.STATE_DIR / f"{slug}.manifest.json"


def load(slug: str) -> dict[str, Any]:
    p = _manifest_path(slug)
    if p.exists():
        with open(p, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {"slug": slug, "episodes": {}}


def save(slug: str, manifest: dict) -> Path:
    p = _manifest_path(slug)
    with open(p, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, sort_keys=True)
    return p


def episode_guid(slug: str, n: int) -> str:
    return f"sa9-{slug}-ep{n:02d}-{uuid.uuid5(_GUID_NS, f'{slug}:{n}')}"


def _pubdate_for(show: dict, n: int) -> str:
    """Deterministic RFC-2822-ready ISO pubdate from start_date + cadence."""
    start = datetime.fromisoformat(show["start_date"]).replace(
        hour=9, minute=0, tzinfo=timezone.utc
    )
    dt = start + timedelta(days=show.get("cadence_days", 7) * (n - 1))
    return dt.isoformat()


def _audio_facts(path: Path) -> tuple[int, int]:
    """(byte_size, duration_seconds) for an mp3."""
    size = path.stat().st_size
    try:
        duration = int(round(MP3(path).info.length))
    except Exception:
        duration = 0
    return size, duration


def upsert_episode(show: dict, manifest: dict, ep_cfg: dict) -> dict:
    """Add/refresh one episode entry from its config + on-disk audio.

    Immutable fields (guid, pubdate) are set once and preserved; mutable facts
    (size, duration) are refreshed from the current file. Returns the entry.
    """
    slug = show["slug"]
    n = ep_cfg["n"]
    key = str(n)
    audio = cfg.audio_path_for(show, n)
    if not audio.exists():
        raise FileNotFoundError(f"Missing audio for ep{n:02d}: {audio}")

    size, duration = _audio_facts(audio)
    existing = manifest["episodes"].get(key, {})

    entry = {
        "n": n,
        "title": ep_cfg["title"],
        "season": ep_cfg.get("season"),
        "description": ep_cfg.get("description", ep_cfg["title"]),
        "guid": existing.get("guid") or episode_guid(slug, n),
        "pubdate": existing.get("pubdate") or _pubdate_for(show, n),
        "audio_url": cfg.public_audio_url(show, n),
        "audio_object": cfg.gcs_audio_name(show, n),
        "audio_local": str(audio),
        "size": size,
        "duration": duration,
    }
    manifest["episodes"][key] = entry
    return entry


def episodes_sorted(manifest: dict) -> list[dict]:
    return [manifest["episodes"][k] for k in sorted(manifest["episodes"], key=int)]
