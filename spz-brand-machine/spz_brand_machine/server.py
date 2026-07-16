"""SPZ Brand Machine — FastMCP server.

Registers the full tool surface. Read tools are safe; write tools route through the
safety layer (kill-switch / dry-run / rate-limits / brand gate / audit). Run with:

    uv run spz-brand-machine            # stdio transport (for MCP clients)
    python -m spz_brand_machine.server  # same
"""

from __future__ import annotations

from typing import Any

from mcp.server.fastmcp import FastMCP

from . import brand_voice, safety
from .config import settings
from .orchestrator import autopilot_tick, run_campaign

mcp = FastMCP("spz-brand-machine")


def _substack():
    from .connectors.substack import SubstackConnector
    return SubstackConnector()


def _meta():
    from .connectors.meta import MetaConnector
    return MetaConnector()


def _err(exc: Exception) -> dict[str, Any]:
    return {"ok": False, "error": str(exc), "type": type(exc).__name__}


@mcp.tool()
def spz_health() -> dict:
    """Connectivity, configuration, ToS-risk, and safety-config status across all
    platforms. Call this first — it never mutates anything."""
    return {
        "llm_ready": settings.llm_ready,
        "substack_ready": settings.substack_ready,
        "meta_ready": settings.meta_ready,
        "safety": safety.status(),
        "tos_warning": (
            "Substack control uses its PRIVATE API + browser automation, which is"
            " against the spirit of Substack ToS. Worst case: account suspension."
            " Rate limits and the kill switch mitigate but do not eliminate this."
        ),
        "brand_sources": [p.name for p in settings.brand_sources],
    }


@mcp.tool()
def spz_substack_analyze() -> dict:
    """Full SPZ Substack account snapshot: subscriber count and recent posts. Read-only."""
    try:
        return {"ok": True, **_substack().analyze()}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_substack_list_posts(limit: int = 20, offset: int = 0) -> dict:
    """List published SPZ Substack posts (paginated). Read-only."""
    try:
        return {"ok": True, "posts": _substack().list_posts(limit, offset)}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_substack_subscribers() -> dict:
    """Subscriber/subscription data + post counts for the SPZ publication. Read-only."""
    try:
        sub = _substack()
        return {
            "ok": True,
            "post_counts": sub.post_counts(),
            "subscriptions": sub.subscriptions_page(),
        }
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_meta_insights() -> dict:
    """Facebook Page + Instagram reach/engagement insights. Read-only."""
    try:
        return {"ok": True, **_meta().insights()}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_brand_generate(channel: str, brief: str, context: str = "") -> dict:
    """Draft an asset in SPZ voice for a channel (substack_post, substack_note,
    facebook, instagram, bio). Returns text only — does not publish."""
    try:
        text = brand_voice.generate(channel, brief, context)
        score = brand_voice.check(text, channel)
        return {
            "ok": True,
            "text": text,
            "brand_score": score.score,
            "passes_gate": score.passed,
        }
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_brand_check(text: str, channel: str = "generic") -> dict:
    """Score arbitrary text 0-100 for SPZ-voice compliance. Read-only."""
    try:
        s = brand_voice.check(text, channel)
        return {
            "ok": True,
            "score": s.score,
            "passes_gate": s.passed,
            "reasons": s.reasons,
            "suggestions": s.suggestions,
        }
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_substack_publish_post(title: str, body_markdown: str, subtitle: str = "",
                              send_email: bool = True, gate: bool = True) -> dict:
    """Publish a long-form SPZ Substack post (draft -> prepublish -> publish).
    If gate=True, the body must clear the SPZ brand-voice score or publishing aborts.
    Honors kill-switch and dry-run."""
    try:
        if gate:
            score = brand_voice.check(f"{title}\n\n{body_markdown}", "substack_post")
            if not score.passed:
                return {
                    "ok": False,
                    "blocked": "brand_gate",
                    "score": score.score,
                    "suggestions": score.suggestions,
                }
        action = _substack().publish_post(title, body_markdown, subtitle, send_email)
        return {"ok": True, "dry_run": action.dry_run, "detail": action.detail}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_substack_post_note(text: str, gate: bool = True) -> dict:
    """Publish a short-form SPZ Substack Note. Brand-gated, kill-switch/dry-run aware."""
    try:
        if gate:
            score = brand_voice.check(text, "substack_note")
            if not score.passed:
                return {
                    "ok": False,
                    "blocked": "brand_gate",
                    "score": score.score,
                    "suggestions": score.suggestions,
                }
        action = _substack().post_note(text)
        return {"ok": True, "dry_run": action.dry_run, "detail": action.detail}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_substack_update_bio(field: str, value: str) -> dict:
    """Update a publication text setting (field: bio | about | welcome | name) via the
    browser fallback. Brand-gated, kill-switch/dry-run aware."""
    try:
        score = brand_voice.check(value, "bio")
        if not score.passed:
            return {
                "ok": False,
                "blocked": "brand_gate",
                "score": score.score,
                "suggestions": score.suggestions,
            }
        action = _substack().update_bio(field, value)
        return {"ok": True, "dry_run": action.dry_run, "detail": action.detail}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_substack_set_pricing(monthly: float | None = None, annual: float | None = None,
                             founding: float | None = None,
                             current_monthly: float | None = None,
                             current_annual: float | None = None) -> dict:
    """Set SPZ subscription pricing (USD) via the browser fallback. Prices are clamped
    to the configured bounds and max single-step delta; out-of-policy values are
    rejected before any change. Kill-switch/dry-run aware."""
    try:
        action = _substack().set_pricing(monthly, annual, founding,
                                         current_monthly, current_annual)
        return {"ok": True, "dry_run": action.dry_run, "detail": action.detail}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_meta_post(platform: str, message: str, image_url: str | None = None,
                  link: str | None = None, gate: bool = True) -> dict:
    """Publish to Meta. platform: 'facebook' or 'instagram' (IG requires image_url).
    Brand-gated, kill-switch/dry-run aware."""
    try:
        channel = "instagram" if platform == "instagram" else "facebook"
        if gate:
            score = brand_voice.check(message, channel)
            if not score.passed:
                return {
                    "ok": False,
                    "blocked": "brand_gate",
                    "score": score.score,
                    "suggestions": score.suggestions,
                }
        meta = _meta()
        if platform == "instagram":
            if not image_url:
                return {"ok": False, "error": "instagram requires image_url"}
            action = meta.post_instagram(message, image_url)
        else:
            action = meta.post_facebook(message, link=link)
        return {"ok": True, "dry_run": action.dry_run, "detail": action.detail}
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_campaign_run(brief: str, kind: str = "substack_post",
                     image_url: str | None = None,
                     link: str | None = None, send_email: bool = True) -> dict:
    """Run a cross-platform SPZ campaign: generate in voice, brand-gate, publish to
    Substack, then fan out to Facebook + Instagram. Honors all guardrails."""
    try:
        r = run_campaign(brief, kind=kind, image_url=image_url, link=link,
                         send_email=send_email)
        return {
            "ok": True,
            "brand_score": r.brand_score,
            "gate_passed": r.gate_passed,
            "substack": r.substack,
            "facebook": r.facebook,
            "instagram": r.instagram,
            "notes": r.notes,
        }
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def spz_autopilot_tick() -> dict:
    """One no-touch autonomous cycle: read the content plan, pick the next due action,
    generate + gate + publish + fan out. Wire to a scheduler/cron for full autonomy.
    Defaults to dry-run until SPZ_AUTOPILOT_DRY_RUN=false."""
    try:
        return {"ok": True, **autopilot_tick()}
    except Exception as exc:
        return _err(exc)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
