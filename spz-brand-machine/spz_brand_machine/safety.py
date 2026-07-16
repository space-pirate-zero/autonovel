"""Machine guardrails for no-touch operation.

No human is in the loop, so the guardrails are the only thing standing between the
autopilot and an irreversible mistake on a live, public brand account:

- KILL SWITCH      — one env flag blocks every mutating action.
- DRY RUN          — generate + log intended actions without touching live accounts.
- RATE LIMITER     — caps mutating actions per platform per rolling hour.
- PRICE BOUNDS     — subscription prices are clamped to a sane range and a max
                     single-step delta (anti fat-finger / anti runaway).
- AUDIT LOG        — append-only JSONL record of every action and its result.
- ACTION GUARD     — single chokepoint every connector write must pass through.

Read-only operations never touch this module.
"""
from __future__ import annotations

import json
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any

from .config import settings


class SafetyError(RuntimeError):
    """Raised when a guardrail blocks an action. Message is actionable."""


@dataclass
class ActionResult:
    ok: bool
    dry_run: bool
    platform: str
    action: str
    detail: str
    payload: dict[str, Any]


_audit_lock = threading.Lock()


def audit(platform: str, action: str, status: str, **fields: Any) -> None:
    """Append-only structured audit record. Never raises into the caller."""
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "platform": platform,
        "action": action,
        "status": status,
        **fields,
    }
    try:
        settings.audit_log_path.parent.mkdir(parents=True, exist_ok=True)
        with _audit_lock, settings.audit_log_path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
    except OSError:
        import sys
        print(f"[spz-audit] failed to write audit record: {record}", file=sys.stderr)


_calls: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = threading.Lock()


def _limit_for(platform: str) -> int:
    return {
        "substack": settings.rate_substack_per_hour,
        "meta": settings.rate_meta_per_hour,
        "facebook": settings.rate_meta_per_hour,
        "instagram": settings.rate_meta_per_hour,
    }.get(platform, 4)


def check_rate(platform: str) -> None:
    """Raise SafetyError if the platform is over its per-hour mutating budget."""
    limit = _limit_for(platform)
    now = time.time()
    window = 3600.0
    with _rate_lock:
        q = _calls[platform]
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= limit:
            wait = int(window - (now - q[0]))
            raise SafetyError(
                f"Rate limit hit for {platform}: {limit}/hour. Next slot in ~"
                f"{wait}s. Raise SPZ_RATE_{platform.upper()}_PER_HOUR only if you understand the ToS/suspension risk."
            )


def _record_call(platform: str) -> None:
    with _rate_lock:
        _calls[platform].append(time.time())


def validate_price(kind: str, new_price: float, current_price: float | None) -> None:
    """kind in {'monthly','annual'}. Raises SafetyError if out of policy."""
    b = settings.price_bounds
    lo, hi = (b.min_monthly, b.max_monthly) if kind == "monthly" else (b.min_annual, b.max_annual)
    if not (lo <= new_price <= hi):
        raise SafetyError(
            f"{kind} price ${new_price:g} outside allowed band ${lo:g}-${hi:g}. Adjust SPZ_PRICE_"
            f"{'MIN' if new_price < lo else 'MAX'}_{kind.upper()} to override."
        )
    if current_price and current_price > 0:
        delta = abs(new_price - current_price) / current_price
        if delta > b.max_delta_frac:
            raise SafetyError(
                f"{kind} price change {current_price:g}->{new_price:g} ("
                f"{delta:.0%}) exceeds max single-step {b.max_delta_frac:.0%}. Step it in smaller increments or raise SPZ_PRICE_MAX_DELTA_FRAC."
            )


def preflight() -> None:
    """Called at the top of every autopilot tick. Raises if the machine must halt."""
    if settings.kill_switch:
        raise SafetyError("KILL SWITCH engaged (SPZ_KILL_SWITCH=true). All writes blocked.")


def guard(platform: str, action: str, payload: dict[str, Any], execute) -> ActionResult:
    """Single chokepoint for every mutating connector action.

    `execute` is a zero-arg callable performing the real side effect; it is only
    invoked when not in dry-run and all guardrails pass.
    """
    if settings.kill_switch:
        audit(platform, action, "blocked_kill_switch", payload=payload)
        raise SafetyError(f"KILL SWITCH engaged — refusing {platform}.{action}.")
    check_rate(platform)
    if settings.dry_run:
        audit(platform, action, "dry_run", payload=payload)
        return ActionResult(True, True, platform, action,
                            "DRY RUN — intended action logged, nothing published.", payload)
    try:
        detail = execute()
    except Exception as exc:
        audit(platform, action, "error", payload=payload, error=str(exc))
        raise
    _record_call(platform)
    audit(platform, action, "ok", payload=payload, detail=str(detail)[:500])
    return ActionResult(True, False, platform, action, str(detail), payload)


def status() -> dict[str, Any]:
    """Snapshot of the safety configuration for the health tool."""
    b = settings.price_bounds
    return {
        "kill_switch": settings.kill_switch,
        "dry_run": settings.dry_run,
        "rate_limits_per_hour": {
            "substack": settings.rate_substack_per_hour,
            "meta": settings.rate_meta_per_hour,
        },
        "price_bounds": asdict(b),
        "brand_min_score": settings.brand_min_score,
        "audit_log": str(settings.audit_log_path),
    }
