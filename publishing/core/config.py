"""Load and normalize publishing/config.yaml.

The repo root is inferred by walking up from this file (publishing/ lives at the
repo root). Show entries are merged over the top-level `defaults` block, and a few
convenience fields (public URLs, absolute paths) are computed here so the rest of
the pipeline never re-derives them.
"""
from __future__ import annotations

import copy
from pathlib import Path
from typing import Any

import yaml

# publishing/core/config.py -> publishing/ -> repo root
REPO_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = REPO_ROOT / "publishing" / "config.yaml"
STATE_DIR = REPO_ROOT / "publishing" / ".state"  # manifests, local feed copies (gitignored)


def _deep_merge(base: dict, over: dict) -> dict:
    out = copy.deepcopy(base)
    for k, v in over.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = copy.deepcopy(v)
    return out


def load_config(path: Path | None = None) -> dict[str, Any]:
    path = path or CONFIG_PATH
    with open(path, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def get_show(slug: str, cfg: dict | None = None) -> dict[str, Any]:
    """Return a fully-resolved show config for `slug`.

    Raises KeyError if the show is not defined.
    """
    cfg = cfg or load_config()
    shows = cfg.get("shows", {})
    if slug not in shows:
        raise KeyError(f"Unknown show '{slug}'. Known: {sorted(shows)}")

    defaults = cfg.get("defaults", {})
    show = _deep_merge(defaults, shows[slug])
    show["slug"] = slug

    gcs = show.get("gcs", {})
    bucket = gcs.get("bucket")
    public_base = gcs.get("public_base") or f"https://storage.googleapis.com/{bucket}"
    prefix = show["gcs_prefix"]
    show["_bucket"] = bucket
    show["_public_prefix"] = f"{public_base}/{prefix}"
    show["feed_url"] = f"{public_base}/{prefix}/feed.xml"
    show["cover_url"] = f"{public_base}/{prefix}/cover.jpg"

    # Absolute local paths
    show["_audio_dir"] = REPO_ROOT / show["audio_dir"]
    show["_cover_path"] = REPO_ROOT / show["cover_art"]
    return show


def list_shows(cfg: dict | None = None) -> list[str]:
    cfg = cfg or load_config()
    return sorted(cfg.get("shows", {}))


def audio_path_for(show: dict, n: int) -> Path:
    """Absolute path to the produced mp3 for episode n."""
    return show["_audio_dir"] / show["audio_pattern"].format(n=n)


def gcs_audio_name(show: dict, n: int) -> str:
    """Object name (within the bucket) for episode n's audio."""
    fname = show["audio_pattern"].format(n=n)
    return f"{show['gcs_prefix']}/audio/{fname}"


def public_audio_url(show: dict, n: int) -> str:
    fname = show["audio_pattern"].format(n=n)
    return f"{show['_public_prefix']}/audio/{fname}"
