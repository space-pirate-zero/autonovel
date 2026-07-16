"""SPZ Asset Catalog — MCP server (FastMCP, streamable HTTP) for Cloud Run.

Exposes vector search + browse + ingest over the asset catalog. Every request is
gated by a bearer token (env SPZ_ASSET_MCP_TOKEN, from Secret Manager) except the
/healthz probe. Listens on $PORT.

Local dev: if SPZ_ASSET_MCP_TOKEN is unset, auth is disabled (a warning prints).
"""
from __future__ import annotations

import hmac
import os
import tempfile
from typing import Any

from fastmcp import FastMCP
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, PlainTextResponse

import generate  # sibling module
import store  # sibling module

mcp = FastMCP(
    name="SPZ Asset Catalog",
    instructions=(
        "Vector-searchable catalog of every asset SPZ creates (images, video, "
        "animation, brand kits, copy, audio) across properties like 'the-last-"
        "human-ceo', 'neko-death-cult', 'digital-insurgency', 'zero-trust-reality', "
        "and 'brand-spz'. Use search_assets to find assets by natural-language "
        "description; filter by property/type/tag. Every result includes a public "
        "URL you can hand back to the user."
    ),
)

VALID_TYPES = ["image", "animation", "video", "vector", "brand-kit", "copy", "audio", "doc", "other"]


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

@mcp.tool
def search_assets(query: str, property: str | None = None, type: str | None = None,
                  tag: str | None = None, limit: int = 10) -> dict[str, Any]:
    """Semantically search the asset catalog by describing what you want.

    Ranks images, video keyframes, copy, and brand kits together in one shared
    multimodal embedding space, so a description like "neon cel-shaded cover of a
    cat" or "moody noir audiogram" matches even when the filename says nothing.

    Args:
        query: Natural-language description of the asset you're looking for.
        property: Optional filter, e.g. 'the-last-human-ceo', 'neko-death-cult',
            'digital-insurgency', 'zero-trust-reality', 'brand-spz'.
        type: Optional filter, one of: image, animation, video, vector, brand-kit,
            copy, audio, doc.
        tag: Optional single tag to require (exact, lowercase).
        limit: Max results (default 10).

    Returns: {"results": [asset, ...]} ranked best-first; each asset has
        public_url, caption, tags, property, type, and a similarity score.
    """
    return {"results": store.search(query, property, type, tag, limit)}


@mcp.tool
def list_assets(property: str | None = None, type: str | None = None,
                tag: str | None = None, limit: int = 25) -> dict[str, Any]:
    """Browse/filter the catalog without a semantic query (metadata filters only).

    Args:
        property: Optional property filter.
        type: Optional asset-type filter.
        tag: Optional exact tag filter (lowercase).
        limit: Max results (default 25).
    """
    return {"results": store.list_assets(property, type, tag, limit)}


@mcp.tool
def list_properties() -> dict[str, Any]:
    """Overview of the whole catalog: total asset count, and per-property and
    per-type breakdowns. Good first call to see what's indexed."""
    return store.list_properties()


@mcp.tool
def get_asset(asset_id: str) -> dict[str, Any]:
    """Fetch full metadata for one asset by its id (the sha256 in search/list
    results), including a fresh time-limited `download_url` (the bucket is
    private) and the stored text_content."""
    doc = store.get_asset(asset_id)
    if not doc:
        return {"error": "not found", "asset_id": asset_id}
    url = store.signed_url(asset_id, minutes=60)
    if url:
        doc["download_url"] = url
    return doc


@mcp.tool
def get_download_url(asset_id: str, expires_minutes: int = 60) -> dict[str, Any]:
    """Mint a time-limited, shareable download URL for a private-bucket asset.
    Use this to hand the user (or a browser) a working link to any asset from a
    search/list result. Defaults to 60 minutes.

    Args:
        asset_id: The asset id (sha256) from a search/list/get result.
        expires_minutes: Link lifetime in minutes (default 60).
    """
    url = store.signed_url(asset_id, minutes=expires_minutes)
    if not url:
        return {"error": "could not sign url (asset missing or signing unavailable)",
                "asset_id": asset_id}
    return {"asset_id": asset_id, "download_url": url, "expires_minutes": expires_minutes}


@mcp.tool
def find_similar(asset_id: str, limit: int = 10) -> dict[str, Any]:
    """Find assets most similar to an existing one ("more like this"), by its
    embedding. Pass an asset_id from a previous search/list result."""
    return {"results": store.find_similar(asset_id, limit)}


@mcp.tool
def ingest_asset(source: str, property: str | None = None,
                 type: str | None = None, force: bool = False) -> dict[str, Any]:
    """Add (or refresh) a single asset in the catalog: upload to the canonical
    bucket, auto-caption/tag/embed it, and index it.

    Args:
        source: A local file path, a gs:// URI, or an http(s):// URL.
        property: Optional property override (else inferred from the path).
        type: Optional asset-type override (else auto-detected).
        force: Re-ingest even if the same content is already indexed.

    Returns the resulting asset doc with status 'indexed' or 'skipped'.
    """
    if source.startswith("gs://"):
        return store.index_gcs_object(source, property, type, force=force)
    if source.startswith(("http://", "https://")):
        return _ingest_url(source, property, type, force)
    if not os.path.exists(source):
        return {"error": f"local path not found: {source}"}
    return store.index_local_file(source, property, type, force=force)


@mcp.tool
def generate_asset(topic: str, property: str = "brand-spz", style: str | None = None,
                   motif: str | None = None, aspect_ratio: str | None = None,
                   art_direction: str = "", reference_asset_ids: list[str] | None = None,
                   count: int = 1, add_to_catalog: bool = True) -> dict[str, Any]:
    """Generate a 100% on-brand image (Space Pirate Zero house style) and add it
    to the catalog, ready for socials. Every prompt is wrapped in the SPZ brand
    kit (cyberpunk-noir; void #030303 + hot-pink #FF1493 + signal-cyan #00F0FF;
    newsprint/VHS grit) so output is on-brand by construction.

    Great for real-time/topical assets: pass the current topic as `topic` and the
    brand styling is applied automatically.

    Args:
        topic: What to depict — the subject/headline/topical idea (e.g.
            "our new zero-trust guide dropping today", "a lone starship fleeing a
            collapsing datacenter"). Brand look is added for you.
        property: Catalog property to file it under (default 'brand-spz'; use e.g.
            'the-last-human-ceo', 'neko-death-cult', 'stylelift', or 'socials').
        style: House style key — 'spz' (default, full cyberpunk-noir) or
            'spz-clean' (minimal logo/icon on void). See list_brand_styles().
        motif: Optional recurring motif to anchor the image — one of
            'spaceship', 'signal', 'portrait', 'tabloid'.
        aspect_ratio: 'square'/'1:1' (default), 'story'/'reel' (9:16),
            'portrait' (4:5), 'landscape'/'wide' (16:9), 'og' (1.91:1).
        art_direction: Optional extra direction layered on top of the brand style.
        reference_asset_ids: Optional catalog asset ids to condition on for
            character/subject consistency (e.g. the canonical SPZ head).
        count: How many variations to generate (default 1).
        add_to_catalog: If true (default), upload + caption + embed each result so
            it's immediately searchable; if false, just return the generated bytes.

    Returns: {"results": [asset, ...]} — each an indexed catalog doc (with
        public_url, caption, tags, and generation provenance) or a generated-only
        stub when add_to_catalog is false.
    """
    res = generate.generate(topic, property_=property, style=style, motif=motif,
                            aspect=aspect_ratio, extra_direction=art_direction,
                            reference_asset_ids=reference_asset_ids, count=count,
                            auto_index=add_to_catalog)
    return {"results": res}


@mcp.tool
def list_brand_styles() -> dict[str, Any]:
    """List the available on-brand generation styles and motifs (for
    generate_asset), plus the aspect-ratio presets."""
    from generate import _style_pack
    pack = _style_pack()
    return {"styles": generate.list_styles(), "motifs": generate.list_motifs(),
            "aspects": pack["aspects"], "default_style": pack["default_style"]}


def _ingest_url(url: str, property: str | None, type: str | None, force: bool) -> dict[str, Any]:
    import urllib.request
    suffix = os.path.splitext(url.split("?")[0])[1] or ""
    fd, tmp = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    try:
        urllib.request.urlretrieve(url, tmp)  # noqa: S310 - operator-supplied URL
        prop = property
        return store.index_local_file(tmp, prop, type, force=force)
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass


# ---------------------------------------------------------------------------
# Health check (auth-exempt)
# ---------------------------------------------------------------------------

@mcp.custom_route("/healthz", methods=["GET"])
async def healthz(_req: Request) -> PlainTextResponse:
    return PlainTextResponse("ok")


# ---------------------------------------------------------------------------
# Bearer-token middleware
# ---------------------------------------------------------------------------

class BearerAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.rstrip("/") in ("", "/healthz"):
            return await call_next(request)
        token = os.environ.get("SPZ_ASSET_MCP_TOKEN", "")
        if token:
            auth = request.headers.get("authorization", "")
            presented = auth[7:] if auth.startswith("Bearer ") else ""
            if not presented or not hmac.compare_digest(presented, token):
                return JSONResponse({"error": "unauthorized"}, status_code=401)
        return await call_next(request)


def build_app():
    app = mcp.http_app(transport="http")
    app.add_middleware(BearerAuthMiddleware)
    return app


app = build_app()


if __name__ == "__main__":
    import uvicorn

    if not os.environ.get("SPZ_ASSET_MCP_TOKEN"):
        print("!! SPZ_ASSET_MCP_TOKEN unset — auth DISABLED (local dev mode)")
    port = int(os.environ.get("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
