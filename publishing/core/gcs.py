"""Upload audio, cover art, and the feed to Google Cloud Storage.

Auth uses Application Default Credentials (your `gcloud auth application-default
login`). Public read is granted once at the bucket level in Phase 0
(allUsers -> roles/storage.objectViewer) with uniform bucket-level access, so we
do NOT set per-object ACLs here — we only set sensible Cache-Control headers.
"""
from __future__ import annotations

from pathlib import Path

try:
    from google.cloud import storage
except ImportError:  # keep import-time failures friendly
    storage = None

# Audio/art are immutable once published; the feed must never be stale.
_CACHE_AUDIO = "public, max-age=31536000, immutable"
_CACHE_FEED = "public, max-age=300, must-revalidate"


def _client():
    if storage is None:
        raise RuntimeError(
            "google-cloud-storage is not installed. Run: uv sync"
        )
    return storage.Client()


def upload_file(
    bucket: str,
    local_path: str | Path,
    object_name: str,
    content_type: str,
    cache_control: str,
) -> str:
    blob = _client().bucket(bucket).blob(object_name)
    blob.cache_control = cache_control
    blob.upload_from_filename(str(local_path), content_type=content_type)
    return f"https://storage.googleapis.com/{bucket}/{object_name}"


def upload_bytes(
    bucket: str,
    data: bytes,
    object_name: str,
    content_type: str,
    cache_control: str,
) -> str:
    blob = _client().bucket(bucket).blob(object_name)
    blob.cache_control = cache_control
    blob.upload_from_string(data, content_type=content_type)
    return f"https://storage.googleapis.com/{bucket}/{object_name}"


def upload_audio(show: dict, n: int, local_path: str | Path) -> str:
    from . import config as cfg

    return upload_file(
        show["_bucket"],
        local_path,
        cfg.gcs_audio_name(show, n),
        "audio/mpeg",
        _CACHE_AUDIO,
    )


def upload_cover(show: dict, local_path: str | Path) -> str:
    return upload_file(
        show["_bucket"],
        local_path,
        f"{show['gcs_prefix']}/cover.jpg",
        "image/jpeg",
        _CACHE_AUDIO,
    )


def upload_feed(show: dict, feed_xml: bytes) -> str:
    return upload_bytes(
        show["_bucket"],
        feed_xml,
        f"{show['gcs_prefix']}/feed.xml",
        "application/rss+xml; charset=utf-8",
        _CACHE_FEED,
    )
