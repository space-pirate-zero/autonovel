"""Thin Claude client over the Messages API (reuses ANTHROPIC_API_KEY).

Kept dependency-free (httpx only) so it works the same way the rest of the autonovel
pipeline talks to Claude. NOTE: opus-4-8 rejects the `temperature` param (see repo
buglog 2026-06-18) — we never send it.
"""

from __future__ import annotations

import json
from typing import Any

import httpx

from .config import settings

API_URL = "https://api.anthropic.com/v1/messages"
API_VERSION = "2023-06-01"


GEN_MODEL = "claude-opus-4-8"
JUDGE_MODEL = "claude-haiku-4-5-20251001"


class LLMError(RuntimeError):
    pass


def _call(model: str, system: str, user: str, max_tokens: int = 2000) -> str:
    if not settings.anthropic_api_key:
        raise LLMError("ANTHROPIC_API_KEY missing — set it in the repo .env.")
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": API_VERSION,
        "content-type": "application/json",
    }
    body = {
        "model": model,
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }
    try:
        resp = httpx.post(API_URL, headers=headers, json=body, timeout=120)
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise LLMError(f"Claude API {exc.response.status_code}: {exc.response.text[:300]}") from exc
    except httpx.HTTPError as exc:
        raise LLMError(f"Claude API request failed: {exc}") from exc
    data = resp.json()
    parts = [b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"]
    return "".join(parts).strip()


def generate(system: str, user: str, max_tokens: int = 2000) -> str:
    return _call(GEN_MODEL, system, user, max_tokens)


def judge_json(system: str, user: str, max_tokens: int = 1000) -> dict[str, Any]:
    """Run the cheap model and parse a single JSON object from its reply."""
    raw = _call(JUDGE_MODEL, system + "\n\nReply with ONLY a JSON object.", user, max_tokens)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise LLMError(f"Judge did not return JSON: {raw[:200]}")
    return json.loads(raw[start : end + 1])
