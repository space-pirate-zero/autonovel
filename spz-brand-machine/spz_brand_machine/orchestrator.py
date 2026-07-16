"""No-touch orchestration.

Two entry points:

- run_campaign(...): publish one piece of content and fan it out across spokes —
  a Substack post (or Note), then a Facebook post and an Instagram caption derived
  from it, all generated in SPZ voice and gated by the brand-voice scorer.

- autopilot_tick(): one heartbeat of the autonomous loop. Driven by an external
  scheduler (the harness /schedule cloud cron or mcp__scheduled-tasks). Reads a
  simple content plan, decides the next due action, and executes it through the
  guarded connectors. In dry-run (default) it logs intended actions only.

The plan is a JSON file (content_plan.json) so the author can steer the machine
without code changes. If absent, the tick falls back to a "keep the feed warm with
an on-brand Note" behavior.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from . import brand_voice, safety
from .config import PROJECT_DIR, settings

PLAN_PATH = PROJECT_DIR / "content_plan.json"


@dataclass
class CampaignResult:
    brand_score: int
    gate_passed: bool
    substack: dict[str, Any] = field(default_factory=dict)
    facebook: dict[str, Any] = field(default_factory=dict)
    instagram: dict[str, Any] = field(default_factory=dict)
    notes: str = ""


def _result(action: safety.ActionResult) -> dict[str, Any]:
    return {"ok": action.ok, "dry_run": action.dry_run, "detail": action.detail}


def run_campaign(brief: str, *, kind: str = "substack_post", image_url: str | None = None,
                 link: str | None = None, send_email: bool = True) -> CampaignResult:
    """Generate in SPZ voice, gate, publish to Substack, fan out to FB/IG."""
    text, score = brand_voice.generate_and_gate(kind, brief)
    res = CampaignResult(brand_score=score.score, gate_passed=score.passed)
    if not score.passed:
        res.notes = (
            f"Brand-voice gate FAILED ({score.score}/{settings.brand_min_score}). Nothing published. Notes: "
            f"{score.suggestions}"
        )
        safety.audit(
            "orchestrator", "campaign_gate_fail", "blocked",
            score=score.score, brief=brief[:200],
        )
        return res

    from .connectors.substack import SubstackConnector

    sub = SubstackConnector()
    if kind == "substack_note":
        res.substack = _result(sub.post_note(text))
    else:
        title, body = _split_title(text)
        res.substack = _result(sub.publish_post(title, body, send_email=send_email))

    try:
        from .connectors.meta import MetaConnector

        meta = MetaConnector()
        fb_text, fb_score = brand_voice.generate_and_gate(
            "facebook", f"Promote this SPZ piece to Facebook. Source:\n{text[:1500]}"
        )
        if fb_score.passed:
            res.facebook = _result(meta.post_facebook(fb_text, link=link))
        else:
            res.facebook = {"skipped": f"fb gate {fb_score.score}"}
        if image_url:
            ig_text, ig_score = brand_voice.generate_and_gate(
                "instagram", f"Promote this SPZ piece to Instagram. Source:\n{text[:1500]}"
            )
            if ig_score.passed:
                res.instagram = _result(meta.post_instagram(ig_text, image_url))
            else:
                res.instagram = {"skipped": f"ig gate {ig_score.score}"}
        else:
            res.instagram = {"skipped": "no image_url provided"}
    except RuntimeError as exc:
        res.notes = f"Spokes skipped: {exc}"
    return res


def _split_title(text: str) -> tuple[str, str]:
    lines = text.strip().split("\n", 1)
    title = lines[0].lstrip("# ").strip()
    body = lines[1].strip() if len(lines) > 1 else ""
    return title or "Transmission", body or text


def _load_plan() -> dict[str, Any]:
    if PLAN_PATH.exists():
        try:
            return json.loads(PLAN_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass
    return {}


def autopilot_tick() -> dict[str, Any]:
    """One no-touch cycle. Safe to call from cron. Honors kill-switch + dry-run."""
    started = datetime.now(timezone.utc).isoformat()
    try:
        safety.preflight()
    except safety.SafetyError as exc:
        return {"ts": started, "halted": True, "reason": str(exc)}

    plan = _load_plan()
    queue = plan.get("queue", [])

    now = datetime.now(timezone.utc).isoformat()
    due = next((item for item in queue
                if not item.get("done") and item.get("scheduled_for", now) <= now), None)

    if due is None:
        brief = plan.get(
            "default_note_brief",
            "A short SPZ transmission Note: a wry, dark-funny aside on machines, money, or the human premium — in Space Pirate Zero's voice.",
        )
        res = run_campaign(brief, kind="substack_note")
        return {
            "ts": started, "action": "default_note", "dry_run": settings.dry_run,
            "brand_score": res.brand_score, "gate_passed": res.gate_passed,
            "substack": res.substack, "notes": res.notes,
        }

    res = run_campaign(
        due.get("brief", ""),
        kind=due.get("kind", "substack_post"),
        image_url=due.get("image_url"),
        link=due.get("link"),
        send_email=due.get("send_email", True),
    )

    if res.gate_passed and not settings.dry_run:
        due["done"] = True
        try:
            PLAN_PATH.write_text(json.dumps(plan, indent=2), encoding="utf-8")
        except OSError:
            pass

    return {
        "ts": started, "action": "campaign", "kind": due.get("kind"),
        "dry_run": settings.dry_run, "brand_score": res.brand_score,
        "gate_passed": res.gate_passed, "substack": res.substack,
        "facebook": res.facebook, "instagram": res.instagram, "notes": res.notes,
    }
