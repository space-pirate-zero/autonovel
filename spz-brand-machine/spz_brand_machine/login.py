"""One-time Substack login for the persistent Playwright session.

    python -m spz_brand_machine.login

Opens a real browser window to the Substack sign-in page. Sign in there yourself
(the machine never handles your password). Once logged in, the session is stored in
the dedicated profile dir and the brand machine can refresh cookies on its own.
"""

from __future__ import annotations

import sys

from .connectors.playwright_session import interactive_login, refresh_env_cookies


def main() -> int:
    if not interactive_login():
        return 1
    masked = refresh_env_cookies()
    print("Cookies refreshed into .env:", masked, file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
