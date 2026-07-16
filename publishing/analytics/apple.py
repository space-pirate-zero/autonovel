"""Apple Podcasts Connect API — analytics (downloads/followers).

This is the ONE real analytics API in the stack (Apple's). It is approval-gated:
you generate an API key in Podcasts Connect (Users and Access -> Keys), which gives
you a Key ID, an Issuer ID, and a downloaded `.p8` private key. Put these in .env:

  APPLE_PODCASTS_KEY_ID=XXXXXXXXXX
  APPLE_PODCASTS_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  APPLE_PODCASTS_P8_PATH=/abs/path/to/AuthKey_XXXXXXXXXX.p8

The JWT construction below is concrete and correct (ES256, 20-min expiry). The
exact analytics endpoints/report shapes change and are account-specific, so
`get_show_trends` is intentionally thin: it authenticates and hits the endpoint you
configure, returning raw JSON for the caller to map. Adjust `TRENDS_PATH` once your
key is provisioned and you can see the real report URLs in Podcasts Connect.

If PyJWT/cryptography aren't installed (they're in the `publishing-extras` group)
or the key isn't configured, callers get a clear RuntimeError and analytics simply
skip Apple — the rest of the dashboard still works.
"""
from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any

import httpx

BASE = "https://api.podcastsconnect.apple.com"
TRENDS_PATH = "/v1/analyticsReportRequests"  # adjust to your provisioned report URL


def _configured() -> bool:
    return all(
        os.getenv(k)
        for k in ("APPLE_PODCASTS_KEY_ID", "APPLE_PODCASTS_ISSUER_ID", "APPLE_PODCASTS_P8_PATH")
    )


def make_jwt() -> str:
    if not _configured():
        raise RuntimeError(
            "Apple Podcasts Connect not configured. Set APPLE_PODCASTS_KEY_ID, "
            "APPLE_PODCASTS_ISSUER_ID, APPLE_PODCASTS_P8_PATH in .env."
        )
    try:
        import jwt  # PyJWT
    except ImportError as e:
        raise RuntimeError(
            "PyJWT not installed. Run: uv sync --extra publishing-extras"
        ) from e

    key_id = os.environ["APPLE_PODCASTS_KEY_ID"]
    issuer_id = os.environ["APPLE_PODCASTS_ISSUER_ID"]
    private_key = Path(os.environ["APPLE_PODCASTS_P8_PATH"]).read_text()
    now = int(time.time())
    return jwt.encode(
        {"iss": issuer_id, "iat": now, "exp": now + 20 * 60, "aud": "podcastsconnect-v1"},
        private_key,
        algorithm="ES256",
        headers={"kid": key_id, "typ": "JWT"},
    )


def _get(path: str, params: dict | None = None) -> Any:
    token = make_jwt()
    r = httpx.get(
        f"{BASE}{path}",
        headers={"Authorization": f"Bearer {token}"},
        params=params or {},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def get_show_trends(show_provider_id: str, params: dict | None = None) -> Any:
    """Fetch analytics for a show. `show_provider_id` is the Apple show id.

    Returns raw JSON. Map to downloads/followers in analytics_server once you can
    see the concrete report shape for your account.
    """
    return _get(TRENDS_PATH, {"showId": show_provider_id, **(params or {})})


def available() -> bool:
    return _configured()
