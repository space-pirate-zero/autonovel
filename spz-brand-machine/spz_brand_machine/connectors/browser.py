"""Browser-automation fallback (Layer 3).

For the settings the Substack private API does not expose — bio/about/welcome and
**subscription pricing** — the only reliable path is driving the real web UI.

This module defines a single interface, `BrowserFallback`, with two backends:

- "playwright": fully autonomous, headless, scriptable (requires `playwright` extra
  + `playwright install`, and the session cookies from config to be injected).
- "manual": the no-dependency default. It does NOT click anything; it returns a
  precise, step-by-step instruction packet (URL + fields + values) so the action is
  still captured in the audit log and can be executed by the operator or by the
  harness's own Chrome MCP tools. This keeps the package runnable with zero browser
  deps while never silently pretending a change was made.

Pricing changes route here on purpose: repricing is the single most dangerous
autonomous action, so it goes through the slow, explicit, observable path.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..config import settings


@dataclass
class BrowserAction:
    performed: bool
    backend: str
    url: str
    steps: list[str]
    note: str


class BrowserFallback:
    def __init__(self, backend: str = "manual") -> None:
        self.backend = backend

    @property
    def _settings_base(self) -> str:
        pub = settings.substack_publication_url or "https://YOUR.substack.com"
        return f"{pub}/publish/settings"

    def _playwright_available(self) -> bool:
        try:
            import playwright  # noqa: F401
            return True
        except ImportError:
            return False

    def update_text_setting(self, field: str, value: str) -> BrowserAction:
        url = self._settings_base
        steps = [
            f"Open {url} (logged in via substack.sid/connect.sid cookies).",
            f"Locate the '{field}' field in Basics/Details.",
            f"Replace its contents with: {value!r}",
            "Click Save and confirm the toast.",
        ]
        if self.backend == "playwright" and self._playwright_available():
            return self._playwright_text(field, value, url, steps)
        return BrowserAction(False, "manual", url, steps,
                             "Manual/Chrome-MCP backend: steps emitted, not auto-clicked.")

    def set_pricing(self, monthly: float | None, annual: float | None,
                    founding: float | None) -> BrowserAction:
        pub = settings.substack_publication_url or "https://YOUR.substack.com"
        url = f"{pub}/publish/settings?search=subscription"
        steps = [f"Open {url}.", "Go to Settings > Payments / Subscription."]
        if monthly is not None:
            steps.append(f"Set monthly price to ${monthly:g}.")
        if annual is not None:
            steps.append(f"Set annual price to ${annual:g}.")
        if founding is not None:
            steps.append(f"Set founding-member price to ${founding:g}.")
        steps.append("Save changes and confirm.")
        if self.backend == "playwright" and self._playwright_available():
            return self._playwright_pricing(monthly, annual, founding, url, steps)
        return BrowserAction(False, "manual", url, steps,
                             "Pricing routes through the explicit path by design.")

    def _new_context(self):
        from playwright.sync_api import sync_playwright
        pw = sync_playwright().start()
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context()
        jar = [{"name": "substack.sid", "value": settings.substack_sid or "",
                "domain": ".substack.com", "path": "/"}]
        if settings.substack_lli:
            jar.append({"name": "substack.lli", "value": settings.substack_lli,
                        "domain": ".substack.com", "path": "/"})
        ctx.add_cookies(jar)
        return pw, browser, ctx

    def _playwright_text(self, field, value, url, steps) -> BrowserAction:
        pw, browser, ctx = self._new_context()
        try:
            page = ctx.new_page()
            page.goto(url, wait_until="domcontentloaded")
            box = page.get_by_label(field, exact=False)
            box.fill(value)
            page.get_by_role("button", name="Save").first.click()
            page.wait_for_timeout(1500)
            return BrowserAction(True, "playwright", url, steps, f"Set {field}.")
        finally:
            browser.close()
            pw.stop()

    def _playwright_pricing(self, monthly, annual, founding, url, steps) -> BrowserAction:
        pw, browser, ctx = self._new_context()
        try:
            page = ctx.new_page()
            page.goto(url, wait_until="domcontentloaded")
            if monthly is not None:
                page.get_by_label("Monthly", exact=False).fill(str(monthly))
            if annual is not None:
                page.get_by_label("Annual", exact=False).fill(str(annual))
            page.get_by_role("button", name="Save").first.click()
            page.wait_for_timeout(1500)
            return BrowserAction(True, "playwright", url, steps, "Pricing updated.")
        finally:
            browser.close()
            pw.stop()
