"""Layered Substack connector.

Layer 1: python-substack library (if installed) — battle-tested write surface.
Layer 2: direct httpx client against the centralized endpoint map.
Layer 3: browser fallback for bio / pricing / settings.

All mutating operations pass through `safety.guard`, so kill-switch / dry-run /
rate-limits / audit apply uniformly. Reads never mutate and skip the guard.
"""
from __future__ import annotations

import sys
from typing import Any

import httpx

from .. import safety
from ..config import settings
from .browser import BrowserFallback
from .substack_endpoints import ENDPOINTS


class SubstackEndpointError(RuntimeError):
    """Raised when a private endpoint fails. Names the path + suggested fallback."""


def _have_python_substack() -> bool:
    try:
        import substack
        return True
    except ImportError:
        return False


class SubstackConnector:

    def __init__(self) -> None:
        if not settings.substack_ready:
            raise RuntimeError('Substack not configured. Set SPZ_SUBSTACK_SID, SPZ_SUBSTACK_CONNECT_SID, and SPZ_SUBSTACK_PUBLICATION_URL in .env (cookies from a logged-in browser).')
        self.pub = settings.substack_publication_url
        self._global = 'https://substack.com'
        self.browser = BrowserFallback(backend='manual')
        self._cookie_override = None
        self._refreshed = False
        if _have_python_substack():
            self._lib = self._init_lib()
            return
        self._lib = None

    def _init_lib(self):
        try:
            from substack import Api
            return Api(publication_url=self.pub, cookies=self._cookies)
        except Exception as exc:
            print(f'[spz-substack] python-substack init failed, using httpx layer: {exc}', file=sys.stderr)
            return None

    @property
    def _cookies(self) -> dict[str, str]:
        if self._cookie_override:
            return self._cookie_override
        jar = {'substack.sid': settings.substack_sid or ''}
        if settings.substack_lli:
            jar['substack.lli'] = settings.substack_lli
        if settings.substack_cf_clearance:
            jar['cf_clearance'] = settings.substack_cf_clearance
        if settings.substack_connect_sid:
            jar['connect.sid'] = settings.substack_connect_sid
        return jar

    @property
    def _headers(self) -> dict[str, str]:
        return {
            'user-agent': settings.substack_user_agent,
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'referer': f'{self.pub}/publish/home',
            'origin': self.pub,
            'content-type': 'application/json',
        }

    def _url(self, base: str, path: str) -> str:
        if base == 'PUB':
            return self.pub + path
        return self._global + path

    def _try_refresh(self) -> bool:
        """Pull fresh cookies from the persistent Playwright profile (if available)."""
        self._refreshed = True
        try:
            from .playwright_session import get_fresh_cookies
            fresh = get_fresh_cookies()
            if 'substack.sid' not in fresh:
                return False
            self._cookie_override = fresh
            print('[spz-substack] session auto-refreshed from persistent browser profile.', file=sys.stderr)
            return True
        except Exception as exc:
            print(f'[spz-substack] cookie auto-refresh unavailable: {exc}', file=sys.stderr)
            return False

    def _request(self, name: str, *, json_body: dict | None = None, **fmt) -> Any:
        (method, base, path_tmpl, stability) = ENDPOINTS[name]
        if stability == 'NONE':
            raise SubstackEndpointError(f"No private endpoint for '{name}' — use the browser fallback path.")
        if stability == 'VERIFY':
            print(f"[spz-substack] using VERIFY endpoint '{name}' ({method} {path_tmpl}); confirm against your live account.", file=sys.stderr)
        url = self._url(base, path_tmpl.format(**fmt))
        try:
            resp = httpx.request(method, url, cookies=self._cookies, json=json_body, timeout=60, headers=self._headers)
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            code = exc.response.status_code
            if code in (401, 403) and not self._refreshed and self._try_refresh():
                return self._request(name, json_body=json_body, **fmt)
            hint = 'auth cookies stale and auto-refresh unavailable — run `python -m spz_brand_machine.login`' \
                if code in (401, 403) \
                else 'endpoint may have moved (VERIFY/STABLE drift)'
            raise SubstackEndpointError(f'{method} {url} -> {code}. {hint}.') from exc
        except httpx.HTTPError as exc:
            raise SubstackEndpointError(f'{method} {url} failed: {exc}') from exc
        if resp.headers.get('content-type', '').startswith('application/json'):
            return resp.json()
        return resp.text

    def post_counts(self) -> Any:
        """{published, drafts, scheduled} counts (authenticated)."""
        return self._request('post_counts')

    def subscriptions_page(self) -> Any:
        """Authenticated subscriptions/publicationUsers payload."""
        return self._request('subscriptions_page')

    def list_posts(self, limit: int = 20, offset: int = 0) -> Any:
        """Public published-posts feed (works unauthenticated)."""
        return self._request('list_posts', limit=limit, offset=offset)

    def list_managed_posts(self, limit: int = 25, offset: int = 0) -> Any:
        """Authenticated post-management list (published, with management fields)."""
        return self._request('posts_published', limit=limit, offset=offset)

    def get_post(self, post_id: str) -> Any:
        return self._request('get_post', post_id=post_id)

    def analyze(self) -> dict:
        """Aggregate account snapshot for the analysis tool."""
        snapshot = {'publication': self.pub}
        for key, fn in (
            ('post_counts', self.post_counts),
            ('subscriptions', self.subscriptions_page),
            ('recent_posts', lambda: self.list_posts(limit=10)),
        ):
            try:
                snapshot[key] = fn()
            except SubstackEndpointError as exc:
                snapshot[key] = {'error': str(exc)}
        return snapshot

    def publish_post(self, title: str, body_markdown: str, subtitle: str = '',
                     send_email: bool = True, audience: str = 'everyone') -> safety.ActionResult:
        """Create a draft -> prepublish -> publish. Long-form."""
        payload = {'title': title, 'subtitle': subtitle, 'send_email': send_email, 'audience': audience, 'len': len(body_markdown)}

        def _execute() -> str:
            if self._lib is not None:
                return self._publish_via_lib(title, subtitle, body_markdown, send_email, audience)
            return self._publish_via_http(title, subtitle, body_markdown, send_email, audience)

        return safety.guard('substack', 'publish_post', payload, _execute)

    def _publish_via_lib(self, title, subtitle, body_md, send_email, audience) -> str:
        from substack.post import Post
        me = self._lib.get_user_id()
        post = Post(title=title, subtitle=subtitle, user_id=me)
        for para in body_md.split('\n\n'):
            if not para.strip():
                continue
            post.paragraph(para.strip())
        draft = self._lib.post_draft(post.get_draft())
        draft_id = draft.get('id')
        self._lib.prepublish_draft(draft_id)
        self._lib.publish_draft(draft_id, send_email=send_email, audience=audience)
        return f'published draft {draft_id} via python-substack'

    def _publish_via_http(self, title, subtitle, body_md, send_email, audience) -> str:
        doc = {
            'type': 'doc',
            'content': [
                {'type': 'paragraph', 'content': [{'type': 'text', 'text': p.strip()}]}
                for p in body_md.split('\n\n')
                if p.strip()
            ],
        }
        import json as _json
        draft = self._request('create_draft', json_body={
            'draft_title': title,
            'draft_subtitle': subtitle,
            'draft_body': _json.dumps(doc),
            'type': 'newsletter',
            'audience': audience,
        })
        draft_id = draft.get('id') if isinstance(draft, dict) else None
        if not draft_id:
            raise SubstackEndpointError(f'create_draft returned no id: {draft}')
        self._request('prepublish_draft', draft_id=draft_id)
        self._request('publish_draft', draft_id=draft_id, json_body={'send_email': send_email})
        return f'published draft {draft_id} via httpx layer'

    def post_note(self, text: str) -> safety.ActionResult:
        payload = {'text': text, 'len': len(text)}

        def _execute() -> str:
            if self._lib is not None and hasattr(self._lib, 'post_to_notes'):
                self._lib.post_to_notes(text)
                return 'note posted via python-substack'
            self._request('post_note', json_body={
                'bodyJson': {'type': 'doc', 'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': text}]}]},
                'tabId': 'for-you',
                'surface': 'feed',
            })
            return 'note posted via httpx layer'

        return safety.guard('substack', 'post_note', payload, _execute)

    def update_bio(self, field: str, value: str) -> safety.ActionResult:
        """field in {bio, about, welcome, name}."""
        payload = {'field': field, 'value': value}

        def _execute() -> str:
            action = self.browser.update_text_setting(field, value)
            return f'{action.backend}: {action.note} | steps={action.steps}'

        return safety.guard('substack', f'update_{field}', payload, _execute)

    def set_pricing(self, monthly: float | None = None, annual: float | None = None,
                    founding: float | None = None,
                    current_monthly: float | None = None,
                    current_annual: float | None = None) -> safety.ActionResult:
        if monthly is not None:
            safety.validate_price('monthly', monthly, current_monthly)
        if annual is not None:
            safety.validate_price('annual', annual, current_annual)
        payload = {'monthly': monthly, 'annual': annual, 'founding': founding}

        def _execute() -> str:
            action = self.browser.set_pricing(monthly, annual, founding)
            return f'{action.backend}: {action.note} | steps={action.steps}'

        return safety.guard('substack', 'set_pricing', payload, _execute)
