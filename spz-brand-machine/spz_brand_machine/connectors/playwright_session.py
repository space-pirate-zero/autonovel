"""Playwright persistent-session backend — the cookie-rotation fix.

The problem: substack.sid rotates (~weekly). A static cookie in .env goes stale and
pauses the no-touch machine.

The fix: a DEDICATED Playwright Chrome profile (separate from the user's everyday
Chrome, so there's no profile-lock conflict) that the user logs into ONCE. The
browser then maintains the session itself — rotating substack.sid as needed — and
the connector pulls the *current* cookies from the live context on demand. No more
manual extraction.

Flow:
  1. One-time:  `python -m spz_brand_machine.login`  → opens headed Chrome to the
     Substack login page; the user signs in (they type their own credentials — the
     machine never handles the password). Session persists in the profile dir.
  2. Thereafter: get_fresh_cookies() launches the profile headless, reads
     context.cookies() for substack.com, returns the live substack.sid / lli /
     cf_clearance. SubstackConnector calls this automatically on a 403.

Requires the `browser` extra:  uv pip install -e ".[browser]" && playwright install chromium
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from ..config import PROJECT_DIR, settings

DEFAULT_PROFILE_DIR = PROJECT_DIR / ".chrome-profile"
LOGIN_URL = "https://substack.com/sign-in"
WANTED = ("substack.sid", "substack.lli", "cf_clearance")


def _profile_dir() -> Path:
    raw = getattr(settings, "chrome_profile_dir", None) or str(DEFAULT_PROFILE_DIR)
    p = Path(raw)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _require_playwright():
    try:
        from playwright.sync_api import sync_playwright
        return sync_playwright
    except ImportError as exc:
        raise RuntimeError(
            'Playwright not installed. Run: uv pip install -e ".[browser]" && python -m playwright install chromium'
        ) from exc


def interactive_login(timeout_s: int = 300) -> bool:
    """Open a headed browser to the Substack login and wait until the user is signed
    in (detected by the presence of substack.sid). Returns True on success."""
    sync_playwright = _require_playwright()
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(_profile_dir()),
            headless=False,
            user_agent=settings.substack_user_agent,
            args=["--no-first-run", "--no-default-browser-check"],
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(LOGIN_URL)
        print("A browser window opened. Sign in to Substack there. Waiting up to %ds for login..."
              % timeout_s, file=sys.stderr)
        import time
        deadline = time.time() + timeout_s
        ok = False
        while time.time() < deadline:
            names = {c["name"] for c in ctx.cookies("https://substack.com")}
            if "substack.sid" in names:
                ok = True
                break
            page.wait_for_timeout(2000)
        ctx.close()
        if ok:
            print("Login captured. Session stored in", _profile_dir(), file=sys.stderr)
        else:
            print("Timed out waiting for login.", file=sys.stderr)
        return ok


def get_fresh_cookies() -> dict[str, str]:
    """Launch the persistent profile headless and return the current Substack cookies.
    Raises RuntimeError if not logged in (run interactive_login first)."""
    sync_playwright = _require_playwright()
    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=str(_profile_dir()),
            headless=True,
            user_agent=settings.substack_user_agent,
        )
        try:
            page = ctx.pages[0] if ctx.pages else ctx.new_page()
            try:
                page.goto(f"{settings.substack_publication_url}/publish/home",
                          wait_until="domcontentloaded", timeout=30000)
            except Exception:
                pass
            jar = {c["name"]: c["value"]
                   for c in ctx.cookies("https://substack.com")}
        finally:
            ctx.close()
    if "substack.sid" not in jar:
        raise RuntimeError(
            "Persistent profile is not logged in. Run: python -m spz_brand_machine.login"
        )
    return {k: jar[k] for k in WANTED if k in jar}


def refresh_env_cookies() -> dict[str, str]:
    """Pull fresh cookies and persist them into the repo .env (so the httpx layer and
    future processes pick them up). Returns the names refreshed."""
    fresh = get_fresh_cookies()
    env_path = PROJECT_DIR.parent / ".env"
    keymap = {
        "substack.sid": "SPZ_SUBSTACK_SID",
        "substack.lli": "SPZ_SUBSTACK_LLI",
        "cf_clearance": "SPZ_SUBSTACK_CF_CLEARANCE",
    }
    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    updates = {keymap[k]: v for k, v in fresh.items() if k in keymap}
    out, seen = [], set()
    for line in lines:
        key = line.split("=", 1)[0].strip() if "=" in line and not line.lstrip().startswith("#") else None
        if key in updates:
            out.append(f'{key}="{updates[key]}"')
            seen.add(key)
        else:
            out.append(line)
    for k, v in updates.items():
        if k not in seen:
            out.append(f'{k}="{v}"')
    env_path.write_text("\n".join(out) + "\n", encoding="utf-8")
    return {k: f"{v[:6]}…{v[-4:]}" for k, v in fresh.items()}
