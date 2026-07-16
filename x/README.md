# x/ — the @spaceshipalpha9 X (Twitter) channel

Publish, read, and manage the studio's X profile **[@spaceshipalpha9](https://x.com/spaceshipalpha9)**
from this repo, in the SPZ voice, alongside the other channels (`linkedin/`,
`substack/`, `publishing/`).

- **[`PROFILE.md`](PROFILE.md)** — the reference doc for the account itself: what
  the node is, its voice, content pillars, cross-channel map, and the X API
  tiers/limits. Read that to understand *the social network*; read on here to
  *operate* it.
- **`xclient.py`** — the client library (`XClient`) wrapping the X API v2 (+ v1.1
  for media/profile). Import it from other scripts to automate posting.
- **`xcli.py`** — the command line for humans.

Everything routes through one account by default (`X_HANDLE`, default
`spaceshipalpha9`); pass `--handle other` to read a different profile.

---

## 1. One-time setup: get API keys

Posting and managing require **OAuth 1.0a user-context** keys tied to
@spaceshipalpha9. Minting them (≈10 min, do it while logged in as the account):

1. Go to **[developer.x.com](https://developer.x.com)** → apply for/open a
   developer account for @spaceshipalpha9.
2. Create a **Project** and an **App** inside it.
3. In the App's **User authentication settings**, set app permissions to
   **Read and write** (add **Direct Messages** only if you need DM access). Type:
   **Web App / Automated App or Bot**. This is what makes the access token able to
   *write* — if you generate tokens before setting this, regenerate them after.
4. On **Keys and tokens**, copy:
   - **API Key** and **API Key Secret** → `X_API_KEY` / `X_API_SECRET`
   - **Access Token** and **Access Token Secret** → `X_ACCESS_TOKEN` /
     `X_ACCESS_TOKEN_SECRET` (these are the @spaceshipalpha9 user tokens)
   - **Bearer Token** → `X_BEARER_TOKEN` (optional, app-only reads)

> **Access tier matters** (see `PROFILE.md` §"API reality"). The **Free** tier can
> *write* (create/delete tweets, ~500/mo) and call `get_me`, but **cannot read**
> user timelines or mentions — those need **Basic** ($200/mo) or above. `post`,
> `thread`, `reply`, `delete`, `set-profile`, `whoami` work on Free; `read`,
> `tweet`, `mentions`, `export` need Basic+.

## 2. Put the keys in `.env`

The repo-root **`.env`** is gitignored. Add (template in `.env.example`):

```bash
X_API_KEY=...
X_API_SECRET=...
X_ACCESS_TOKEN=...
X_ACCESS_TOKEN_SECRET=...
X_BEARER_TOKEN=...            # optional
X_HANDLE=spaceshipalpha9      # optional (default)
```

Secrets are also mirrored in Google Secret Manager (project `stylelift`) per the
studio convention — regenerate `.env` with `load-secrets.sh` after adding them
there, or just edit `.env` directly.

## 3. Use it

`tweepy` is a project dependency, so run through **uv**. **Add `--dry-run` to any
write to rehearse it** — it prints the exact payload, hits no network, and needs
no credentials.

```bash
# --- identity / read ---
uv run python x/xcli.py whoami
uv run python x/xcli.py profile                     # @spaceshipalpha9 bio + counts
uv run python x/xcli.py profile @someone --json
uv run python x/xcli.py read -n 20 --no-retweets    # recent tweets
uv run python x/xcli.py tweet 1780000000000000000   # one tweet
uv run python x/xcli.py mentions -n 30
uv run python x/xcli.py export                       # full backup -> x/export/profile.json

# --- publish ---
uv run python x/xcli.py --dry-run post "Signal finds signal. 🏴‍☠️"
uv run python x/xcli.py post "Deface the counterfeit. Live honest." --media art.png
uv run python x/xcli.py post "$(cat long_take.txt)" --split      # auto-threads if >280
uv run python x/xcli.py thread "Hook." "The turn." "The landing." --number
uv run python x/xcli.py thread --file x/drafts/manifesto.md      # auto-split a file
uv run python x/xcli.py reply 178000... "cosign."

# --- manage ---
uv run python x/xcli.py delete 178000...
uv run python x/xcli.py like 178000...              # --off to unlike
uv run python x/xcli.py retweet 178000...           # --off to unretweet
uv run python x/xcli.py follow @someone             # --off to unfollow
uv run python x/xcli.py set-profile --bio "Transmitted from the salvage decks." \
    --url "https://spacepiratezero.com"
```

### From Python

```python
from x.xclient import XClient
x = XClient()                       # or XClient(dry_run=True)
me = x.me()                         # dict: id, followers, tweets, ...
x.post("Signal finds signal.")
x.thread(["Hook.", "Turn.", "Landing."])
x.export_profile("x/export/profile.json")
```

## 4. What's covered

| Verb | Commands | Endpoint family |
|---|---|---|
| **Publish** | `post`, `thread`, `reply`, media attach, quote | v2 `create_tweet` + v1.1 `media_upload` |
| **Read** | `whoami`, `profile`, `read`, `tweet`, `mentions`, `export` | v2 `get_me` / `get_user(s)` / `get_users_tweets` / `get_users_mentions` / `get_tweet` |
| **Manage** | `delete`, `like`, `retweet`, `follow`, `set-profile` | v2 `delete_tweet` / `like` / `retweet` / `follow_user` + v1.1 `update_profile` |

**Not exposed** (no supported public endpoint, by design — nothing here fakes an
API): pinning a tweet, editing a posted tweet's text, uploading avatar/banner via
v2, scheduling native to X. Schedule from the repo instead (a cron/GitHub Action
calling `xcli.py post`), the way `substack/` schedules drafts.

## 5. Verify without spending

The offline-safe logic (character weighting, thread-splitting, arg handling,
credential-error messages) runs with **no keys and no network**:

```bash
uv run python x/xclient.py                 # smoke-test weighting + thread split
uv run python x/xcli.py --dry-run post "$(python3 -c "print('la '*200)")"  # see the thread it'd make
```

Live posting can only be verified once the four `X_*` keys are in `.env`; start
with `--dry-run`, then drop it.
