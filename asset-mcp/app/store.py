"""Firestore (vector index) + GCS storage layer for the asset catalog.

Owns the canonical document schema, the content-addressed GCS layout, the
idempotent ingest core (shared by ingest.py and the MCP ingest_asset tool), and
the vector/query read paths (search / list / get / find_similar / properties).

Clients are created lazily so `import store` stays cheap and credential-free.
"""
from __future__ import annotations

import hashlib
import mimetypes
import os
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

import enrich  # sibling module

_MIME_OVERRIDES = {
    ".md": "text/markdown", ".webp": "image/webp", ".svg": "image/svg+xml",
    ".m4v": "video/mp4", ".lottie": "application/json",
}


@lru_cache(maxsize=1)
def _cfg() -> dict[str, Any]:
    return enrich.load_config()


# ---------------------------------------------------------------------------
# Lazy clients
# ---------------------------------------------------------------------------

_fs = None
_bucket = None


def _db():
    global _fs
    if _fs is None:
        from google.cloud import firestore
        g = _cfg()["gcp"]
        _fs = firestore.Client(project=os.environ.get("GCP_PROJECT", g["project"]),
                               database=os.environ.get("FIRESTORE_DB", g["firestore_db"]))
    return _fs


def _collection():
    return _db().collection(os.environ.get("FIRESTORE_COLLECTION",
                                           _cfg()["gcp"]["collection"]))


def _gcs_bucket():
    global _bucket
    if _bucket is None:
        from google.cloud import storage
        g = _cfg()["gcp"]
        client = storage.Client(project=os.environ.get("GCP_PROJECT", g["project"]))
        _bucket = client.bucket(os.environ.get("ASSET_BUCKET", g["bucket"]))
    return _bucket


def _bucket_name() -> str:
    return os.environ.get("ASSET_BUCKET", _cfg()["gcp"]["bucket"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def guess_mime(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in _MIME_OVERRIDES:
        return _MIME_OVERRIDES[ext]
    return mimetypes.guess_type(path)[0] or "application/octet-stream"


def gcs_key(property_: str, atype: str, sha: str, filename: str) -> str:
    safe = filename.replace(" ", "_")
    return f"{property_}/{atype}/{sha[:8]}-{safe}"


def public_url(key: str) -> str:
    return f"https://storage.googleapis.com/{_bucket_name()}/{key}"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_asset(asset_id: str) -> dict[str, Any] | None:
    snap = _collection().document(asset_id).get()
    return _clean(snap.to_dict()) if snap.exists else None


def _clean(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """Strip the raw embedding vector from API responses (huge, not useful)."""
    if not doc:
        return doc
    out = {k: v for k, v in doc.items() if k != "embedding"}
    if "_distance" in out and out["_distance"] is not None:
        out["score"] = round(1.0 - float(out["_distance"]), 4)  # cosine distance -> similarity
    return out


# ---------------------------------------------------------------------------
# Ingest core (idempotent, content-addressed)
# ---------------------------------------------------------------------------

def index_local_file(path: str, property_: str | None = None,
                     asset_type: str | None = None, *, force: bool = False,
                     extra_fields: dict[str, Any] | None = None,
                     source_override: str | None = None) -> dict[str, Any]:
    """Enrich + upload + upsert one local file. Idempotent by sha256 (re-ingest
    of unchanged content is a no-op unless force=True). Returns the doc summary.

    extra_fields: merged into the Firestore doc (e.g. generation provenance).
    source_override: value for source_path (else inferred repo-relative path)."""
    path = str(path)
    sha = sha256_file(path)
    existing = _collection().document(sha).get()
    if existing.exists and not force:
        return {"status": "skipped", **(_clean(existing.to_dict()) or {})}

    rel = source_override or _repo_rel(path)
    prop = property_ or enrich.infer_property(rel)
    en = enrich.enrich(path, asset_type)
    atype = en.type
    filename = os.path.basename(path)
    key = gcs_key(prop, atype, sha, filename)
    mime = guess_mime(path)

    # upload bytes to GCS (skip if object already present with same key)
    blob = _gcs_bucket().blob(key)
    if force or not blob.exists():
        blob.cache_control = "public,max-age=86400"
        blob.upload_from_filename(path, content_type=mime)

    doc: dict[str, Any] = {
        "id": sha,
        "property": prop,
        "gcs_uri": f"gs://{_bucket_name()}/{key}",
        "public_url": public_url(key),
        "mime": mime,
        "bytes": os.path.getsize(path),
        "sha256": sha,
        "filename": filename,
        "source_path": rel,
        "created_at": _now_iso(),
        **en.as_doc_fields(),
    }
    if extra_fields:
        doc.update(extra_fields)
    if en.embedding:
        from google.cloud.firestore_v1.vector import Vector
        doc["embedding"] = Vector(en.embedding)
    _collection().document(sha).set(doc)
    return {"status": "indexed", **(_clean(doc) or {})}


def download_bytes(asset_id: str) -> tuple[bytes, str] | None:
    """Fetch an indexed asset's raw bytes + mime from GCS (for reference-image
    conditioning). Returns None if the asset or object is missing."""
    doc = get_asset(asset_id)
    if not doc or not doc.get("gcs_uri"):
        return None
    from google.cloud import storage
    uri = doc["gcs_uri"]
    bkt, _, obj = uri[5:].partition("/")
    client = storage.Client(project=os.environ.get("GCP_PROJECT", _cfg()["gcp"]["project"]))
    blob = client.bucket(bkt).blob(obj)
    if not blob.exists():
        return None
    return blob.download_as_bytes(), (doc.get("mime") or "image/png")


def index_gcs_object(gcs_uri: str, property_: str | None = None,
                     asset_type: str | None = None, *, force: bool = False) -> dict[str, Any]:
    """Index an object that already lives in GCS by downloading to a temp file,
    enriching, and recording it (keeps its original bucket location as source)."""
    import tempfile
    from google.cloud import storage

    assert gcs_uri.startswith("gs://")
    bkt, _, obj = gcs_uri[5:].partition("/")
    client = storage.Client(project=os.environ.get("GCP_PROJECT", _cfg()["gcp"]["project"]))
    blob = client.bucket(bkt).blob(obj)
    suffix = os.path.splitext(obj)[1]
    fd, tmp = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    try:
        blob.download_to_filename(tmp)
        sha = sha256_file(tmp)
        existing = _collection().document(sha).get()
        if existing.exists and not force:
            return {"status": "skipped", **(_clean(existing.to_dict()) or {})}
        prop = property_ or enrich.infer_property(obj)
        en = enrich.enrich(tmp, asset_type)
        doc: dict[str, Any] = {
            "id": sha, "property": prop,
            "gcs_uri": gcs_uri,
            "public_url": f"https://storage.googleapis.com/{bkt}/{obj}",
            "mime": guess_mime(obj), "bytes": blob.size or os.path.getsize(tmp),
            "sha256": sha, "filename": os.path.basename(obj),
            "source_path": gcs_uri, "created_at": _now_iso(),
            **en.as_doc_fields(),
        }
        if en.embedding:
            from google.cloud.firestore_v1.vector import Vector
            doc["embedding"] = Vector(en.embedding)
        _collection().document(sha).set(doc)
        return {"status": "indexed", **(_clean(doc) or {})}
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass


def _repo_rel(path: str) -> str:
    """Best-effort repo-relative path for property inference + provenance."""
    ap = os.path.abspath(path)
    marker = "/autonovel/"
    if marker in ap:
        tail = ap.split(marker, 1)[1]
        # strip a worktree prefix like ".claude/worktrees/<name>/"
        import re
        tail = re.sub(r"^\.claude/worktrees/[^/]+/", "", tail)
        return tail
    return os.path.relpath(ap)


# ---------------------------------------------------------------------------
# Read paths
# ---------------------------------------------------------------------------

def _apply_filters(q, property_: str | None, atype: str | None, tag: str | None):
    from google.cloud.firestore_v1.base_query import FieldFilter
    if property_:
        q = q.where(filter=FieldFilter("property", "==", property_))
    if atype:
        q = q.where(filter=FieldFilter("type", "==", atype))
    if tag:
        q = q.where(filter=FieldFilter("tags", "array_contains", tag.lower()))
    return q


def search(query: str, property_: str | None = None, atype: str | None = None,
           tag: str | None = None, limit: int = 10) -> list[dict[str, Any]]:
    """Semantic search across the shared multimodal space, with metadata prefilters."""
    from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
    from google.cloud.firestore_v1.vector import Vector

    qvec = enrich.embed_text(query)
    q = _apply_filters(_collection(), property_, atype, tag)
    results = q.find_nearest(
        vector_field="embedding",
        query_vector=Vector(qvec),
        distance_measure=DistanceMeasure.COSINE,
        limit=int(limit),
        distance_result_field="_distance",
    ).get()
    return [_clean(d.to_dict()) for d in results]


def list_assets(property_: str | None = None, atype: str | None = None,
                tag: str | None = None, limit: int = 25) -> list[dict[str, Any]]:
    q = _apply_filters(_collection(), property_, atype, tag).limit(int(limit))
    return [_clean(d.to_dict()) for d in q.stream()]


def find_similar(asset_id: str, limit: int = 10) -> list[dict[str, Any]]:
    from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

    snap = _collection().document(asset_id).get()
    if not snap.exists:
        return []
    vec = snap.to_dict().get("embedding")
    if vec is None:
        return []
    results = _collection().find_nearest(
        vector_field="embedding",
        query_vector=vec,  # already a Vector when read back
        distance_measure=DistanceMeasure.COSINE,
        limit=int(limit) + 1,
        distance_result_field="_distance",
    ).get()
    out = [_clean(d.to_dict()) for d in results if d.id != asset_id]
    return out[:int(limit)]


def list_properties() -> dict[str, Any]:
    """Catalog overview: per-property and per-type counts (small-collection scan)."""
    props: dict[str, dict[str, Any]] = {}
    types: dict[str, int] = {}
    total = 0
    for d in _collection().select(["property", "type"]).stream():
        total += 1
        rec = d.to_dict()
        p = rec.get("property", "misc")
        t = rec.get("type", "other")
        node = props.setdefault(p, {"count": 0, "types": {}})
        node["count"] += 1
        node["types"][t] = node["types"].get(t, 0) + 1
        types[t] = types.get(t, 0) + 1
    return {"total": total, "properties": props, "types": types}
