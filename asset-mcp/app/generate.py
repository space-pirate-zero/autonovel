"""On-brand image generation via Gemini (Nano Banana / gemini-2.5-flash-image).

Wraps every prompt in the Space Pirate Zero house style (brand/spz_style.json),
optionally conditions on existing catalog assets for character/subject
consistency, generates the image, and auto-indexes the result back into the
catalog (captioned, embedded, searchable) — so a generated social asset is one
call away from being a first-class, findable catalog entry.

Model: gemini-2.5-flash-image via the Gemini API (GEMINI_API_KEY). Chosen to
match the studio's existing Nano Banana workflow and to support multi-image
reference conditioning.
"""
from __future__ import annotations

import json
import os
import re
import tempfile
from functools import lru_cache
from pathlib import Path
from typing import Any

import enrich
import store

_STYLE_PATH = Path(__file__).resolve().parent.parent / "brand" / "spz_style.json"


@lru_cache(maxsize=1)
def _style_pack() -> dict[str, Any]:
    with open(_STYLE_PATH) as fh:
        return json.load(fh)


def _model() -> str:
    return enrich.load_config()["models"].get("image", "gemini-2.5-flash-image")


def _api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    # fall back to Secret Manager (matches load-secrets.sh convention)
    try:
        from google.cloud import secretmanager
        project = os.environ.get("GCP_PROJECT", enrich.load_config()["gcp"]["project"])
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project}/secrets/GEMINI_API_KEY/versions/latest"
        return client.access_secret_version(name=name).payload.data.decode().strip()
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError("GEMINI_API_KEY not set and Secret Manager lookup failed") from exc


# ---------------------------------------------------------------------------
# Brand-grounded prompt construction
# ---------------------------------------------------------------------------

def list_styles() -> dict[str, str]:
    return {k: v.get("label", k) for k, v in _style_pack()["styles"].items()}


def list_motifs() -> dict[str, str]:
    return _style_pack()["motifs"]


def _resolve_style(style: str | None) -> tuple[str, dict[str, Any]]:
    pack = _style_pack()
    key = style or pack.get("default_style", "spz")
    if key not in pack["styles"]:
        key = pack.get("default_style", "spz")
    s = pack["styles"][key]
    # resolve palette (may reference another style's palette)
    if "palette" not in s and s.get("palette_ref"):
        s = {**s, "palette": pack["styles"][s["palette_ref"]]["palette"]}
    return key, s


def _resolve_aspect(aspect: str | None) -> str:
    pack = _style_pack()
    a = aspect or pack.get("default_aspect", "1:1")
    return pack["aspects"].get(a, a)  # allow friendly names (story/reel/…) or raw ratios


def build_prompt(topic: str, style: str | None = None, motif: str | None = None,
                 aspect: str | None = None, extra_direction: str = "") -> str:
    """Compose the full on-brand prompt: subject → house style → palette → rules."""
    _, s = _resolve_style(style)
    pack = _style_pack()
    palette = s.get("palette", pack["styles"]["spz"]["palette"])
    pal = ", ".join(f"{v['hex']} ({v['role'].split('—')[0].strip()})" for v in palette.values())
    ar = _resolve_aspect(aspect)

    parts = [f"Subject: {topic.strip()}."]
    if motif:
        mtext = pack["motifs"].get(motif)
        if mtext:
            parts.append(mtext)
    parts.append(s["master_prompt"])
    parts.append(f"Strict palette — {pal}.")
    parts.extend(s.get("rules", []))
    parts.append(f"Composition: {ar} aspect ratio, deliberate framing, poster-grade.")
    if extra_direction.strip():
        parts.append(f"Art direction: {extra_direction.strip()}.")
    neg = s.get("negative") or pack["styles"]["spz"].get("negative", "")
    if neg:
        parts.append(f"Avoid: {neg}.")
    return " ".join(parts)


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

def _slug(text: str, maxlen: int = 48) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (s[:maxlen].strip("-")) or "asset"


def _extract_image(resp) -> tuple[bytes, str] | None:
    try:
        for part in resp.candidates[0].content.parts:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                return inline.data, (inline.mime_type or "image/png")
    except (AttributeError, IndexError, TypeError):
        pass
    return None


def _refusal_text(resp) -> str:
    try:
        return " ".join(p.text for p in resp.candidates[0].content.parts if getattr(p, "text", None))[:300]
    except Exception:  # noqa: BLE001
        return ""


def generate(topic: str, property_: str = "brand-spz", style: str | None = None,
             motif: str | None = None, aspect: str | None = None,
             extra_direction: str = "", reference_asset_ids: list[str] | None = None,
             count: int = 1, auto_index: bool = True) -> list[dict[str, Any]]:
    """Generate `count` on-brand image(s) for `topic` and (optionally) index them.

    Returns a list of result dicts (catalog docs when auto_index, else local info).
    """
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=_api_key())
    model = _model()
    prompt = build_prompt(topic, style, motif, aspect, extra_direction)
    style_key, _ = _resolve_style(style)
    ar = _resolve_aspect(aspect)

    # base contents: the prompt, plus any reference images for consistency
    base_contents: list[Any] = [prompt]
    used_refs: list[str] = []
    for rid in (reference_asset_ids or []):
        got = store.download_bytes(rid)
        if got:
            data, mime = got
            base_contents.append(types.Part.from_bytes(data=data, mime_type=mime))
            used_refs.append(rid)

    # aspect ratio config (version/model dependent — degrade gracefully)
    def _make_config():
        try:
            return types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(aspect_ratio=ar),
            )
        except Exception:  # noqa: BLE001
            return None

    results: list[dict[str, Any]] = []
    for i in range(max(1, int(count))):
        # vary seed across a batch by nudging the prompt (no RNG available here)
        contents = list(base_contents)
        if i:
            contents[0] = f"{prompt} (variation {i + 1}, distinct composition)"
        img = None
        for cfg in (_make_config(), None):  # retry without image_config if it fails
            try:
                resp = client.models.generate_content(model=model, contents=contents,
                                                       **({"config": cfg} if cfg else {}))
                img = _extract_image(resp)
                if img:
                    break
            except Exception as exc:  # noqa: BLE001
                last_err = str(exc).splitlines()[0][:200]
                continue
        if not img:
            reason = _refusal_text(resp) if "resp" in dir() else locals().get("last_err", "no image returned")
            results.append({"status": "failed", "topic": topic, "reason": reason or "no image returned"})
            continue

        data, mime = img
        ext = ".png" if "png" in mime else ".jpg"
        suffix = f"-{i + 1}" if count > 1 else ""
        fname = f"{_slug(topic)}-{style_key}{suffix}{ext}"
        tmp = os.path.join(tempfile.gettempdir(), fname)
        with open(tmp, "wb") as fh:
            fh.write(data)

        if not auto_index:
            results.append({"status": "generated", "local_path": tmp, "bytes": len(data),
                            "prompt": prompt})
            continue

        extra = {
            "origin": "generated",
            "gen_model": model,
            "gen_style": style_key,
            "gen_topic": topic,
            "gen_motif": motif or "",
            "gen_aspect": ar,
            "gen_prompt": prompt,
            "gen_refs": used_refs,
        }
        doc = store.index_local_file(tmp, property_=property_, asset_type="image",
                                     force=True, extra_fields=extra,
                                     source_override=f"generated:{style_key}/{fname}")
        try:
            os.unlink(tmp)
        except OSError:
            pass
        results.append(doc)
    return results
