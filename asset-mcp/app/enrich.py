"""Shared asset enrichment: type detection, property inference, Gemini
captioning/tagging, Vertex multimodal embeddings, and ffmpeg keyframe/metadata
extraction.

Everything lands in ONE shared 1408-dim multimodal space:
  - images / video keyframes  -> image embedding (multimodalembedding@001)
  - copy / brand-kits / text  -> text embedding (same model)
  - a search query            -> text embedding (same model)
so a single Firestore find_nearest ranks across all modalities.

Used by both the MCP server (app/main.py) and the backfill CLI (ingest.py).
Vertex clients are initialised lazily so importing this module is cheap and
never requires credentials (needed for --dry-run and unit inspection).
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import tempfile
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ANIMATION_MAX_SECONDS = 12.0  # video shorter than this is classified "animation"
_EMBED_TEXT_MAX_CHARS = 900   # multimodalembedding text input is short; keep it tight
_COPY_STORE_MAX_CHARS = 200_000

_MODULE_DIR = Path(__file__).resolve().parent
_REPO_ROOT_HINTS = ("config.json",)


@lru_cache(maxsize=1)
def load_config() -> dict[str, Any]:
    """Load config.json from the asset-mcp dir (parent of app/, or CWD)."""
    for cand in (_MODULE_DIR.parent / "config.json", _MODULE_DIR / "config.json",
                 Path.cwd() / "config.json"):
        if cand.exists():
            with open(cand) as fh:
                return json.load(fh)
    raise FileNotFoundError("config.json not found next to asset-mcp/ or app/")


def _cfg() -> dict[str, Any]:
    return load_config()


# ---------------------------------------------------------------------------
# Type + property classification (pure, no network)
# ---------------------------------------------------------------------------

def detect_type(path: str, duration: float | None = None) -> str:
    """Classify an asset by filename (+ optional media duration)."""
    cfg = _cfg()
    name = os.path.basename(path).lower()
    ext = os.path.splitext(name)[1]

    for bk in cfg.get("brand_kit_files", []):
        if name == bk.lower():
            return "brand-kit"

    for typ, exts in cfg["types"].items():
        if ext in exts:
            # a short "video" is really an animation (gif-like teaser/audiogram loop)
            if typ == "video" and duration is not None and duration <= ANIMATION_MAX_SECONDS:
                return "animation"
            return typ
    return "other"


def infer_property(rel_path: str) -> str:
    """Map a repo-relative path to a property via the config prefix table."""
    p = rel_path.replace("\\", "/").lstrip("./")
    for prefix, prop in _cfg()["property_map"]:
        if p == prefix or p.startswith(prefix.rstrip("/") + "/"):
            return prop
    return "misc"


def should_skip(path: str) -> bool:
    return any(s in path for s in _cfg().get("skip_substrings", []))


# ---------------------------------------------------------------------------
# Lazy Vertex AI clients
# ---------------------------------------------------------------------------

_vertex_ready = False
_mm_model = None
_gemini_model = None


def _init_vertex() -> None:
    global _vertex_ready, _mm_model, _gemini_model
    if _vertex_ready:
        return
    import vertexai
    from vertexai.generative_models import GenerativeModel
    from vertexai.vision_models import MultiModalEmbeddingModel

    cfg = _cfg()
    vertexai.init(project=os.environ.get("GCP_PROJECT", cfg["gcp"]["project"]),
                  location=os.environ.get("GCP_REGION", cfg["gcp"]["region"]))
    _mm_model = MultiModalEmbeddingModel.from_pretrained(cfg["models"]["embedding"])
    _gemini_model = GenerativeModel(cfg["models"]["gemini"])
    _vertex_ready = True


def _embed_dim() -> int:
    return int(_cfg()["models"]["embedding_dim"])


def embed_text(text: str) -> list[float]:
    """Text -> shared multimodal embedding (used for copy AND search queries)."""
    _init_vertex()
    snippet = (text or "").strip()[:_EMBED_TEXT_MAX_CHARS] or "asset"
    emb = _mm_model.get_embeddings(contextual_text=snippet, dimension=_embed_dim())
    return list(emb.text_embedding)


def embed_image(path: str) -> list[float]:
    """Image file -> shared multimodal embedding."""
    _init_vertex()
    from vertexai.vision_models import Image as VMImage
    prepped = _prep_image_for_vertex(path)
    try:
        emb = _mm_model.get_embeddings(image=VMImage.load_from_file(prepped),
                                       dimension=_embed_dim())
        return list(emb.image_embedding)
    finally:
        if prepped != path:
            _safe_unlink(prepped)


# ---------------------------------------------------------------------------
# Gemini captioning / summarisation
# ---------------------------------------------------------------------------

_CAPTION_PROMPT = (
    "You are cataloguing a creative studio's asset. Look at this image and reply "
    "with STRICT JSON: {\"caption\": string, \"tags\": string[]}. "
    "caption: one vivid sentence describing subject, style, mood, and colors so it "
    "can be found later by description. tags: 5-12 short lowercase keywords "
    "(subjects, style, medium, palette, use-case). No prose outside the JSON."
)

_SUMMARY_PROMPT = (
    "You are cataloguing a creative studio's text/brand asset. Summarise the "
    "content below as STRICT JSON: {\"caption\": string, \"tags\": string[]}. "
    "caption: one sentence on what this is and its voice/purpose. tags: 5-12 short "
    "lowercase keywords. No prose outside the JSON.\n\n---\n"
)


def _parse_json_reply(text: str) -> dict[str, Any]:
    m = re.search(r"\{.*\}", text or "", re.DOTALL)
    if not m:
        return {}
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return {}


def caption_image(path: str) -> dict[str, Any]:
    """Gemini vision -> {'caption', 'tags'}. Falls back to filename on error."""
    try:
        _init_vertex()
        from vertexai.generative_models import Part
        prepped = _prep_image_for_vertex(path)
        try:
            with open(prepped, "rb") as fh:
                data = fh.read()
            part = Part.from_data(data=data, mime_type="image/jpeg")
            resp = _gemini_model.generate_content(
                [_CAPTION_PROMPT, part],
                generation_config={"response_mime_type": "application/json",
                                   "temperature": 0.2},
            )
            out = _parse_json_reply(resp.text)
        finally:
            if prepped != path:
                _safe_unlink(prepped)
        if out.get("caption"):
            return {"caption": str(out["caption"]),
                    "tags": _clean_tags(out.get("tags"))}
    except Exception as exc:  # noqa: BLE001 - enrichment is best-effort
        print(f"  ! caption_image failed for {path}: {exc}")
    return _fallback_caption(path)


def summarize_text(text: str, path: str) -> dict[str, Any]:
    """Gemini -> {'caption', 'tags'} for copy / brand kits."""
    try:
        _init_vertex()
        body = (text or "")[:12_000]
        resp = _gemini_model.generate_content(
            _SUMMARY_PROMPT + body,
            generation_config={"response_mime_type": "application/json",
                               "temperature": 0.2},
        )
        out = _parse_json_reply(resp.text)
        if out.get("caption"):
            return {"caption": str(out["caption"]),
                    "tags": _clean_tags(out.get("tags"))}
    except Exception as exc:  # noqa: BLE001
        print(f"  ! summarize_text failed for {path}: {exc}")
    return _fallback_caption(path)


def _clean_tags(tags: Any) -> list[str]:
    if not isinstance(tags, list):
        return []
    seen, out = set(), []
    for t in tags:
        s = str(t).strip().lower()
        if s and s not in seen:
            seen.add(s)
            out.append(s)
    return out[:12]


def _fallback_caption(path: str) -> dict[str, Any]:
    stem = os.path.splitext(os.path.basename(path))[0]
    words = re.split(r"[-_\s]+", stem)
    tags = _clean_tags([w for w in words if len(w) > 2])
    return {"caption": stem.replace("-", " ").replace("_", " ").strip(), "tags": tags}


# ---------------------------------------------------------------------------
# Media helpers (Pillow / ffmpeg / ffprobe)
# ---------------------------------------------------------------------------

def _prep_image_for_vertex(path: str) -> str:
    """Downscale/re-encode to a <=1024px JPEG temp file to stay under API limits.
    Returns the original path if it's already a small jpg/png that's fine to send."""
    try:
        from PIL import Image
        with Image.open(path) as im:
            im = im.convert("RGB")
            if max(im.size) <= 1024 and os.path.getsize(path) < 4_000_000 \
                    and path.lower().endswith((".jpg", ".jpeg")):
                return path
            im.thumbnail((1024, 1024))
            fd, tmp = tempfile.mkstemp(suffix=".jpg")
            os.close(fd)
            im.save(tmp, "JPEG", quality=88)
            return tmp
    except Exception:
        return path


def image_dimensions(path: str) -> tuple[int | None, int | None]:
    try:
        from PIL import Image
        with Image.open(path) as im:
            return im.size[0], im.size[1]
    except Exception:
        return None, None


def dominant_colors(path: str, n: int = 5) -> list[str]:
    try:
        from PIL import Image
        with Image.open(path) as im:
            im = im.convert("RGB")
            im.thumbnail((128, 128))
            q = im.quantize(colors=n)
            pal = q.getpalette()
            counts = sorted(q.getcolors(), reverse=True)
            hexes = []
            for _, idx in counts[:n]:
                r, g, b = pal[idx * 3: idx * 3 + 3]
                hexes.append(f"#{r:02x}{g:02x}{b:02x}")
            return hexes
    except Exception:
        return []


def _run(cmd: list[str]) -> str:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout.strip()


def probe_media(path: str) -> dict[str, Any]:
    """Return {'duration', 'width', 'height'} via ffprobe (best-effort)."""
    out: dict[str, Any] = {"duration": None, "width": None, "height": None}
    try:
        dur = _run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=nw=1:nk=1", path])
        if dur:
            out["duration"] = round(float(dur), 2)
    except Exception:
        pass
    try:
        wh = _run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                   "-show_entries", "stream=width,height", "-of", "csv=p=0", path])
        if wh and "," in wh:
            w, h = wh.split(",")[:2]
            out["width"], out["height"] = int(float(w)), int(float(h))
    except Exception:
        pass
    return out


def extract_keyframes(path: str, duration: float | None, n: int = 3) -> list[str]:
    """Extract up to n representative JPEG frames (temp files). Caller deletes them."""
    frames: list[str] = []
    if duration and duration > 1:
        points = [duration * f for f in (0.1, 0.5, 0.85)][:n]
    else:
        points = [0.0]
    for i, ts in enumerate(points):
        fd, tmp = tempfile.mkstemp(suffix=f"_kf{i}.jpg")
        os.close(fd)
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{ts:.2f}", "-i", path,
                 "-frames:v", "1", "-vf", "scale='min(1024,iw)':-2", tmp],
                capture_output=True, timeout=120, check=False)
            if os.path.getsize(tmp) > 0:
                frames.append(tmp)
            else:
                _safe_unlink(tmp)
        except Exception:
            _safe_unlink(tmp)
    return frames


def _safe_unlink(path: str) -> None:
    try:
        os.unlink(path)
    except OSError:
        pass


def _avg_vectors(vectors: list[list[float]]) -> list[float]:
    if not vectors:
        return []
    n = len(vectors)
    return [sum(col) / n for col in zip(*vectors)]


# ---------------------------------------------------------------------------
# Top-level enrichment
# ---------------------------------------------------------------------------

@dataclass
class Enriched:
    type: str
    caption: str = ""
    tags: list[str] = field(default_factory=list)
    palette: list[str] = field(default_factory=list)
    width: int | None = None
    height: int | None = None
    duration: float | None = None
    text_content: str = ""
    embedding: list[float] = field(default_factory=list)

    def as_doc_fields(self) -> dict[str, Any]:
        return {
            "type": self.type, "caption": self.caption, "tags": self.tags,
            "palette": self.palette, "width": self.width, "height": self.height,
            "duration": self.duration, "text_content": self.text_content,
        }


def enrich(path: str, asset_type: str | None = None, *, embed: bool = True) -> Enriched:
    """Full enrichment for a local file. `embed=False` skips network calls
    (used by --dry-run to preview type/property classification only)."""
    probe = {}
    ext = os.path.splitext(path)[1].lower()
    if ext in _cfg()["types"]["video"] or ext in _cfg()["types"]["audio"]:
        probe = probe_media(path)
    atype = asset_type or detect_type(path, duration=probe.get("duration"))

    if atype in ("image", "vector"):
        return _enrich_image(path, atype, embed)
    if atype in ("video", "animation"):
        return _enrich_video(path, atype, probe, embed)
    if atype in ("copy", "brand-kit", "doc"):
        return _enrich_text(path, atype, embed)
    if atype == "audio":
        return _enrich_audio(path, probe, embed)
    return _enrich_text(path, "other", embed)


def _enrich_image(path: str, atype: str, embed: bool) -> Enriched:
    w, h = image_dimensions(path)
    e = Enriched(type=atype, width=w, height=h, palette=dominant_colors(path))
    if not embed:
        e.caption, e.tags = _fallback_caption(path)["caption"], []
        return e
    cap = caption_image(path) if atype == "image" else _svg_caption(path)
    e.caption, e.tags = cap["caption"], cap["tags"]
    try:
        e.embedding = embed_image(path) if atype == "image" else embed_text(
            f"{e.caption}. tags: {', '.join(e.tags)}")
    except Exception as exc:  # noqa: BLE001
        print(f"  ! embed failed for {path}: {exc}")
    return e


def _svg_caption(path: str) -> dict[str, Any]:
    try:
        txt = Path(path).read_text(errors="ignore")[:8000]
        title = re.search(r"<title>(.*?)</title>", txt, re.DOTALL)
        base = _fallback_caption(path)
        if title:
            base["caption"] = f"{base['caption']} — {title.group(1).strip()}"
        return summarize_text(txt, path) if len(txt) > 200 else base
    except Exception:
        return _fallback_caption(path)


def _enrich_video(path: str, atype: str, probe: dict, embed: bool) -> Enriched:
    e = Enriched(type=atype, width=probe.get("width"), height=probe.get("height"),
                 duration=probe.get("duration"))
    if not embed:
        e.caption = _fallback_caption(path)["caption"]
        return e
    frames = extract_keyframes(path, probe.get("duration"))
    try:
        if frames:
            cap = caption_image(frames[0])
            e.caption, e.tags = cap["caption"], cap["tags"]
            e.palette = dominant_colors(frames[0])
            vecs = []
            for f in frames:
                try:
                    vecs.append(embed_image(f))
                except Exception:
                    pass
            e.embedding = _avg_vectors(vecs)
        if not e.embedding:  # no frames / all embeds failed
            e.caption = e.caption or _fallback_caption(path)["caption"]
            e.embedding = embed_text(e.caption)
    finally:
        for f in frames:
            _safe_unlink(f)
    return e


def _enrich_text(path: str, atype: str, embed: bool) -> Enriched:
    try:
        raw = Path(path).read_text(errors="ignore")
    except Exception:
        raw = ""
    e = Enriched(type=atype, text_content=raw[:_COPY_STORE_MAX_CHARS])
    if not embed:
        e.caption = _fallback_caption(path)["caption"]
        return e
    summ = summarize_text(raw, path) if raw.strip() else _fallback_caption(path)
    e.caption, e.tags = summ["caption"], summ["tags"]
    try:
        e.embedding = embed_text(f"{e.caption}. {', '.join(e.tags)}. {raw[:400]}")
    except Exception as exc:  # noqa: BLE001
        print(f"  ! embed failed for {path}: {exc}")
    return e


def _enrich_audio(path: str, probe: dict, embed: bool) -> Enriched:
    e = Enriched(type="audio", duration=probe.get("duration"))
    fb = _fallback_caption(path)
    e.caption, e.tags = fb["caption"], fb["tags"]
    if embed:
        try:
            e.embedding = embed_text(f"audio: {e.caption}. {', '.join(e.tags)}")
        except Exception as exc:  # noqa: BLE001
            print(f"  ! embed failed for {path}: {exc}")
    return e
