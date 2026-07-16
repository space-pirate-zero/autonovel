"""Central configuration. Loads the repo .env (root and package-local) and exposes
typed settings for connectors and the safety layer."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*_a, **_k):
        return False

PKG_DIR = Path(__file__).resolve().parent
PROJECT_DIR = PKG_DIR.parent
REPO_ROOT = PROJECT_DIR.parent


def _load_env() -> None:
    for candidate in (REPO_ROOT / ".env", PROJECT_DIR / ".env"):
        if not candidate.exists():
            continue
        load_dotenv(candidate, override=True)


def _bool(key: str, default: bool) -> bool:
    val = os.getenv(key)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def _float(key: str, default: float) -> float:
    try:
        return float(os.getenv(key, default))
    except (TypeError, ValueError):
        return default


def _int(key: str, default: int) -> int:
    try:
        return int(float(os.getenv(key, default)))
    except (TypeError, ValueError):
        return default


@dataclass
class PriceBounds:
    min_monthly: float
    max_monthly: float
    min_annual: float
    max_annual: float
    max_delta_frac: float


@dataclass
class Settings:
    anthropic_api_key: str | None

    substack_sid: str | None
    substack_lli: str | None
    substack_connect_sid: str | None
    substack_cf_clearance: str | None
    substack_user_agent: str
    substack_publication_url: str | None
    chrome_profile_dir: str | None

    meta_page_id: str | None
    meta_page_token: str | None
    meta_ig_user_id: str | None
    meta_graph_version: str

    kill_switch: bool
    dry_run: bool
    price_bounds: PriceBounds
    rate_substack_per_hour: int
    rate_meta_per_hour: int
    brand_min_score: int
    audit_log_path: Path

    brand_sources: list[Path] = field(default_factory=list)

    @property
    def substack_ready(self) -> bool:
        return bool(self.substack_sid and self.substack_publication_url)

    @property
    def meta_ready(self) -> bool:
        return bool(self.meta_page_id and self.meta_page_token)

    @property
    def llm_ready(self) -> bool:
        return bool(self.anthropic_api_key)


def load_settings() -> Settings:
    _load_env()
    audit = os.getenv("SPZ_AUDIT_LOG", "audit_log.jsonl")
    audit_path = Path(audit)
    if not audit_path.is_absolute():
        audit_path = PROJECT_DIR / audit_path
    brand_sources = [p for p in (
        REPO_ROOT / "STYLE.md",
        REPO_ROOT / "characters.md",
        REPO_ROOT / "canon.md",
        PROJECT_DIR / "brand_voice_spz.md",
    ) if p.exists()]
    return Settings(
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        substack_sid=os.getenv("SPZ_SUBSTACK_SID"),
        substack_lli=os.getenv("SPZ_SUBSTACK_LLI"),
        substack_connect_sid=os.getenv("SPZ_SUBSTACK_CONNECT_SID") or None,
        substack_cf_clearance=os.getenv("SPZ_SUBSTACK_CF_CLEARANCE") or None,
        substack_user_agent=os.getenv(
            "SPZ_SUBSTACK_USER_AGENT",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
        ),
        substack_publication_url=(os.getenv("SPZ_SUBSTACK_PUBLICATION_URL") or "").rstrip("/") or None,
        chrome_profile_dir=os.getenv("SPZ_CHROME_PROFILE_DIR") or None,
        meta_page_id=os.getenv("SPZ_META_PAGE_ID"),
        meta_page_token=os.getenv("SPZ_META_PAGE_ACCESS_TOKEN"),
        meta_ig_user_id=os.getenv("SPZ_META_IG_USER_ID"),
        meta_graph_version=os.getenv("SPZ_META_GRAPH_VERSION", "v21.0"),
        kill_switch=_bool("SPZ_KILL_SWITCH", False),
        dry_run=_bool("SPZ_AUTOPILOT_DRY_RUN", True),
        price_bounds=PriceBounds(
            min_monthly=_float("SPZ_PRICE_MIN_MONTHLY", 5),
            max_monthly=_float("SPZ_PRICE_MAX_MONTHLY", 15),
            min_annual=_float("SPZ_PRICE_MIN_ANNUAL", 30),
            max_annual=_float("SPZ_PRICE_MAX_ANNUAL", 150),
            max_delta_frac=_float("SPZ_PRICE_MAX_DELTA_FRAC", 0.34),
        ),
        rate_substack_per_hour=_int("SPZ_RATE_SUBSTACK_PER_HOUR", 3),
        rate_meta_per_hour=_int("SPZ_RATE_META_PER_HOUR", 6),
        brand_min_score=_int("SPZ_BRAND_MIN_SCORE", 80),
        audit_log_path=audit_path,
        brand_sources=brand_sources,
    )


settings = load_settings()
