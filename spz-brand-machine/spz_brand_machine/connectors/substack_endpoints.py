"""Centralized Substack private-API endpoint map.

Substack has no official write API. These are the *internal* endpoints the web app
itself calls, reachable with the session cookies. They are reverse-engineered and
can change without notice, so they live in ONE place and carry a stability tag:

    STABLE  — widely used across the OSS ecosystem (python-substack, substack-api,
              substack-gateway-oss, the n8n node); reliable in practice.
    VERIFY  — known shape but confirm against your live account on first run; the
              connector logs a warning when it uses a VERIFY endpoint.
    NONE    — no private endpoint exists; the connector routes to browser fallback.

Paths use two bases:
    PUB    = https://<publication>.substack.com
    GLOBAL = https://substack.com
"""
from __future__ import annotations

# name -> (method, base, path_template, stability)
ENDPOINTS: dict[str, tuple[str, str, str, str]] = {
    # --- reads ---
    'list_posts': ('GET', 'PUB', '/api/v1/posts?limit={limit}&offset={offset}', 'STABLE'),
    'get_post': ('GET', 'PUB', '/api/v1/posts/by-id/{post_id}', 'STABLE'),
    'post_counts': ('GET', 'PUB', '/api/v1/post_management/counts?query=', 'VERIFIED'),
    'posts_published': ('GET', 'PUB', '/api/v1/post_management/published?offset={offset}&limit={limit}&order_by=post_date&order_direction=desc', 'VERIFIED'),
    'posts_drafts': ('GET', 'PUB', '/api/v1/post_management/drafts?offset={offset}&limit={limit}', 'VERIFY'),
    'subscriptions_page': ('GET', 'PUB', '/api/v1/subscriptions/page_v2', 'VERIFIED'),
    'public_profile': ('GET', 'GLOBAL', '/api/v1/user/{handle}/public_profile', 'STABLE'),
    # --- draft / publish writes ---
    'create_draft': ('POST', 'PUB', '/api/v1/drafts', 'STABLE'),
    'update_draft': ('PUT', 'PUB', '/api/v1/drafts/{draft_id}', 'STABLE'),
    'prepublish_draft': ('GET', 'PUB', '/api/v1/drafts/{draft_id}/prepublish', 'STABLE'),
    'publish_draft': ('POST', 'PUB', '/api/v1/drafts/{draft_id}/publish', 'STABLE'),
    # --- notes ---
    'post_note': ('POST', 'GLOBAL', '/api/v1/comment/feed', 'VERIFY'),
    # --- no private endpoint: browser fallback ---
    'update_bio': ('', '', '', 'NONE'),
    'update_about': ('', '', '', 'NONE'),
    'update_welcome': ('', '', '', 'NONE'),
    'set_pricing': ('', '', '', 'NONE'),
}
