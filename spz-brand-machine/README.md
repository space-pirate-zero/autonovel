# SPZ Brand Machine

An MCP server that runs the **Space Pirate Zero** brand internet-wide, no-touch, in
SPZ voice. Substack is the hub; Facebook + Instagram are the first spokes.

See [SPZ_BRAND_MACHINE.md](SPZ_BRAND_MACHINE.md) for the full architecture.

---

## ⚠️ Read this first — the Substack reality

**Substack has no official write API.** Its sanctioned Developer API is read-only
public-profile data. To control bios, pricing, subscriptions, and publishing this
server uses Substack's **private/internal API** (cookie auth) plus **browser
automation** for settings — exactly like every working OSS Substack tool.

This is **against the spirit of Substack's ToS.** Worst case is **account
suspension.** Guardrails (rate limits, kill switch, human-plausible pacing) reduce
but do not eliminate the risk. By configuring real cookies you accept that risk.
Facebook/Instagram, by contrast, use the official Graph API and are fully sanctioned.

---

## Install

```bash
cd spz-brand-machine
uv venv && source .venv/bin/activate
uv pip install -e ".[all]"      # includes python-substack + playwright
python -m playwright install chromium   # only if using the playwright browser backend
```

`python-substack` (Layer 1) and `playwright` (Layer 3) are optional — the server
runs without them on the direct-httpx + manual-steps fallbacks.

## Configure

Copy `.env.example` into the **repo-root `.env`** (the package reads `../.env` then
`./.env`) and fill in:

- `ANTHROPIC_API_KEY` — already present in your autonovel `.env`.
- `SPZ_SUBSTACK_SID`, `SPZ_SUBSTACK_CONNECT_SID` — from a logged-in browser
  (DevTools → Application → Cookies → substack.com → copy the `substack.sid` and
  `connect.sid` values). These are bearer credentials; never commit them.
- `SPZ_SUBSTACK_PUBLICATION_URL` — e.g. `https://spacepiratezero.substack.com`.
- Meta: `SPZ_META_PAGE_ID`, `SPZ_META_PAGE_ACCESS_TOKEN`, `SPZ_META_IG_USER_ID`.
  IG must be a Business/Creator account linked to the Page; the long-lived Page
  token needs `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`,
  `instagram_content_publish`.

### Safety knobs (all in `.env`)
| Var | Default | Effect |
|---|---|---|
| `SPZ_KILL_SWITCH` | `false` | `true` blocks **all** writes (reads still work) |
| `SPZ_AUTOPILOT_DRY_RUN` | `true` | log intended actions, touch nothing live |
| `SPZ_PRICE_MIN/MAX_MONTHLY/ANNUAL` | 5/15/30/150 | hard price band |
| `SPZ_PRICE_MAX_DELTA_FRAC` | 0.34 | max single-step price change |
| `SPZ_RATE_SUBSTACK_PER_HOUR` | 3 | mutating-action cap |
| `SPZ_RATE_META_PER_HOUR` | 6 | mutating-action cap |
| `SPZ_BRAND_MIN_SCORE` | 80 | min SPZ-voice score to publish |

**Start in dry-run.** Run a few `spz_autopilot_tick` calls, read `audit_log.jsonl`,
confirm the intended actions look right, then set `SPZ_AUTOPILOT_DRY_RUN=false`.

## Run

```bash
uv run spz-brand-machine          # stdio MCP server
```

Register it with your MCP client (Claude Code `~/.claude.json` / `.mcp.json`):

```json
{
  "mcpServers": {
    "spz-brand-machine": {
      "command": "uv",
      "args": ["run", "--directory", "/Users/gregchambers/autonovel/spz-brand-machine", "spz-brand-machine"]
    }
  }
}
```

## Tools

Read-only: `spz_health`, `spz_substack_analyze`, `spz_substack_list_posts`,
`spz_substack_subscribers`, `spz_meta_insights`, `spz_brand_generate`,
`spz_brand_check`.

Guarded writes: `spz_substack_publish_post`, `spz_substack_post_note`,
`spz_substack_update_bio`, `spz_substack_set_pricing`, `spz_meta_post`.

Orchestration: `spz_campaign_run`, `spz_autopilot_tick`.

Always call `spz_health` first.

## No-touch autonomy

`spz_autopilot_tick` is the heartbeat. Drive it from a scheduler — e.g. the Claude
Code `/schedule` cloud cron or the `scheduled-tasks` MCP — to run the brand on its
own. It reads `content_plan.json` (a queue of briefs with `scheduled_for`) and falls
back to keeping the feed warm with an on-brand Note when nothing is due.

Example `content_plan.json`:
```json
{
  "default_note_brief": "A wry SPZ transmission about machines and the human premium.",
  "queue": [
    {"scheduled_for": "2026-06-22T14:00:00+00:00",
     "kind": "substack_post",
     "brief": "Announce the audiobook of The Last Human CEO; tease the Space Pirate Zero reel.",
     "image_url": "https://.../cover.jpg",
     "link": "https://spacepiratezero.substack.com/p/audiobook"}
  ]
}
```

## Cookie rotation & the persistent session (set-and-forget)

`substack.sid` rotates roughly weekly, so a static cookie in `.env` eventually goes
stale and pauses autopilot. The fix is a **dedicated Playwright Chrome profile** that
holds the live session and refreshes cookies on its own:

```bash
uv pip install -e ".[browser]" && python -m playwright install chromium
python -m spz_brand_machine.login     # opens a browser; sign in to Substack ONCE
```

After that, when the connector hits a 401/403 it automatically pulls fresh cookies
from this profile (and rewrites them into `.env`) and retries — no manual extraction.
The profile lives in `./.chrome-profile` (gitignored); override with
`SPZ_CHROME_PROFILE_DIR`. The machine never handles your password — you type it into
the browser yourself during `spz-login`.

## Layered Substack connector

1. **python-substack** (if installed) — drafts → prepublish → publish, Notes, subs.
2. **direct httpx** against `connectors/substack_endpoints.py` (tagged STABLE/VERIFY).
3. **browser fallback** (`connectors/browser.py`) for bio / pricing / settings.

Endpoints tagged `VERIFY` log a warning on use — confirm them against your live
account on first run. Everything fails loud (`SubstackEndpointError`) and never
silently no-ops.
