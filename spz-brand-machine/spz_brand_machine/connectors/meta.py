"""Meta connector — Facebook Page + Instagram via the official Graph API.

Unlike Substack, Meta HAS a sanctioned API, so this is the clean spoke. Requirements
(documented in README): SPZ Facebook Page, an Instagram Business/Creator account
LINKED to that Page, and a long-lived Page access token with scopes:
pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish.

Instagram publishing is two-step: create a media container from an image URL, then
publish the container. IG requires a publicly reachable image URL (not raw bytes).

All writes pass through safety.guard.
"""

from __future__ import annotations

from typing import Any

import httpx

from .. import safety
from ..config import settings


class MetaError(RuntimeError):
    pass


class MetaConnector:
    def __init__(self) -> None:
        if not settings.meta_ready:
            raise RuntimeError(
                "Meta not configured. Set SPZ_META_PAGE_ID and SPZ_META_PAGE_ACCESS_TOKEN (and SPZ_META_IG_USER_ID for Instagram) in .env."
            )
        self.base = f"https://graph.facebook.com/{settings.meta_graph_version}"
        self.page_id = settings.meta_page_id
        self.ig_id = settings.meta_ig_user_id
        self.token = settings.meta_page_token

    def _get(self, path: str, params: dict | None = None) -> Any:
        params = {**(params or {}), "access_token": self.token}
        try:
            resp = httpx.get(f"{self.base}/{path}", params=params, timeout=60)
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise MetaError(
                f"GET {path} -> {exc.response.status_code}: "
                f"{exc.response.text[:300]}"
            ) from exc
        return resp.json()

    def _post(self, path: str, data: dict) -> Any:
        data = {**data, "access_token": self.token}
        try:
            resp = httpx.post(f"{self.base}/{path}", data=data, timeout=60)
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise MetaError(
                f"POST {path} -> {exc.response.status_code}: "
                f"{exc.response.text[:300]}"
            ) from exc
        return resp.json()

    def insights(self) -> dict:
        out = {}
        try:
            out["page"] = self._get(f"{self.page_id}/insights", {
                "metric": "page_impressions,page_post_engagements",
                "period": "week",
            })
        except MetaError as exc:
            out["page"] = {"error": str(exc)}
        if self.ig_id:
            try:
                out["instagram"] = self._get(f"{self.ig_id}/insights", {
                    "metric": "reach,profile_views", "period": "day",
                })
            except MetaError as exc:
                out["instagram"] = {"error": str(exc)}
        return out

    def post_facebook(self, message: str, link: str | None = None) -> safety.ActionResult:
        payload = {"message": message, "link": link}

        def _execute() -> str:
            data = {"message": message}
            if link:
                data["link"] = link
            res = self._post(f"{self.page_id}/feed", data)
            return f"fb post id={res.get('id')}"

        return safety.guard("facebook", "post_facebook", payload, _execute)

    def post_instagram(self, caption: str, image_url: str) -> safety.ActionResult:
        if not self.ig_id:
            raise MetaError("SPZ_META_IG_USER_ID not set — cannot publish to Instagram.")
        payload = {"caption_len": len(caption), "image_url": image_url}

        def _execute() -> str:
            container = self._post(f"{self.ig_id}/media", {
                "image_url": image_url, "caption": caption,
            })
            cid = container.get("id")
            if not cid:
                raise MetaError(f"IG container creation returned no id: {container}")
            published = self._post(f"{self.ig_id}/media_publish", {"creation_id": cid})
            return f"ig media id={published.get('id')}"

        return safety.guard("instagram", "post_instagram", payload, _execute)
