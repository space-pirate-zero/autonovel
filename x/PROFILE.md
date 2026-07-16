# The @spaceshipalpha9 X node — reference

Documentation of the studio's X (Twitter) presence so it can be referenced,
scripted against, and kept on-voice later. This is the *what and why*; `README.md`
is the *how*. Live numbers (followers, join date, pinned tweet) are intentionally
**not** hardcoded here — pull them fresh with `uv run python x/xcli.py profile`.

---

## 1. Identity

| Field | Value |
|---|---|
| Handle | **@spaceshipalpha9** |
| URL | https://x.com/spaceshipalpha9 |
| Who speaks | **Space Pirate Zero (SPZ)** — the studio's author-persona, in-voice |
| What it represents | **Spaceship Alpha 9** — "the premier AI-based storytelling studio in the South," Atlanta, GA |
| Sibling site | [spaceshipalpha9.co](https://spaceshipalpha9.co) (studio) · [spacepiratezero.com](https://spacepiratezero.com) (SPZ personal) |
| Frequency / tagline | ***Signal finds signal.*** |

This account is the frame *leaking into the real world*: the studio is the ship,
the founder is the pirate, every release is "a Space Pirate Zero transmission."
See the canon bible in [`../UNIVERSE.md`](../UNIVERSE.md) before writing anything
in this voice.

## 2. Voice (non-negotiable)

Pulled from [`../voice.md`](../voice.md) and [`../.wolf/cerebrum.md`](../.wolf/cerebrum.md):

- **SPZ voice:** raw, punk, confessional, nihilist-with-a-heart. *Diogenes with a
  laptop, defacing the counterfeit to live honest.* Bar at midnight. Active voice
  only.
- **Spine:** *deface the counterfeit, live honest.* Authenticity beats the machine.
  Punch **up** at the system, never down at workers.
- **Banned words:** leverage, synergy, ecosystem, transform (use "refinance"),
  and the rest of the `voice.md` Part 2 list. If a draft could've come from any
  brand's account, it's wrong.
- **Format on X:** short and barbed, or a numbered thread that earns each tweet.
  One idea per tweet. The hook is a claim, not a throat-clear.

## 3. Content pillars

What this node broadcasts, all in-universe:

1. **Transmissions** — launches & drops from the canon ledger (see `UNIVERSE.md`
   §3): *The Last Human CEO*, *The Maneki Neko Death Cult*, *Digital Insurgency*,
   *Zero Trust Reality*, the *Signal Finds Signal* album.
2. **Fables / field-manual lines** — the same daily material that feeds
   `linkedin/` and `substack/` (30-day *Digital Insurgency* fable series), cut to
   X length. Reuse `substack/series_data.py` copy; don't rewrite from scratch.
3. **Doctrine** — one-line shots of the insurgency ethos (the counterfeit-vs-honest
   axis), quotable and standalone.
4. **Build-in-public** — the studio doubling as the ship: what's rendering,
   shipping, or breaking on the salvage decks.
5. **Signal-boost** — replies/reposts that fit the frequency. Boost up, stay in
   voice even in the mentions.

## 4. Cross-channel map

X is one node in the studio's broadcast graph. Same signal, cut per channel:

```
              (source of truth: books/<book>/ + substack/series_data.py)
                                   │
        ┌──────────────┬───────────┼───────────┬────────────────┐
   substack/        linkedin/     x/         publishing/     brand/spz/
   long fable +     pro cut of    barbed cut  podcast+site     voice+tokens
   Note (daily)     the fable     / thread    RSS (Apple/Spot) every asset
        │                                          │
   spacepiratezero.substack.com            lasthumanceo.com, *.run.app feeds
```

- **Upstream of X:** `substack/series_data.py` (per-day title/nugget/teaser/moral),
  `linkedin/build_li.py` (proof that the daily cut is reusable across channels),
  the books' own `social/` kits (`gen_hooks.py` → `hooks.json`/`quotes.json`).
- **Downstream of X:** links point back to the Substack post, the book's Amazon
  page, and the podcast site — same link set the other channels carry.
- **Brand:** every graphic attached here follows [`../brand/spz/`](../brand/spz/)
  and the motion conventions in [`../standards/SOCIAL.md`](../standards/SOCIAL.md)
  (cyan→pink `0x00F0FF|0xFF1493` waveform, "A SPACE PIRATE ZERO TRANSMISSION"
  kicker).

A natural next build: an `x/build_x.py` that reads `substack/series_data.py` and
emits `x/posts/day_NN.txt` (barbed single tweet **or** a 3–5 tweet thread) with the
day's Substack + book links — exactly mirroring `linkedin/build_li.py`, then fed to
`xcli.py thread --file`. Not built yet; the client + CLI are the foundation for it.

## 5. API reality (tiers, limits, endpoints)

The honest constraints, so plans account for them. X API access is **paid and
tiered**; the account's tier gates what the tooling can do.

| Tier | ~Price | Writes (post/delete) | Reads (timeline/mentions/lookup) |
|---|---|---|---|
| **Free** | $0 | ✅ ~500 posts/mo, `get_me` | ❌ user timelines & mentions blocked |
| **Basic** | ~$200/mo | ✅ ~3,000 posts/mo | ✅ ~10–15k tweet reads/mo |
| **Pro** | ~$5,000/mo | ✅ higher | ✅ ~1M reads/mo, full-archive-ish |

Consequences for this repo:
- `post`, `thread`, `reply`, `delete`, `set-profile`, `whoami` → **Free is enough.**
- `read`, `tweet`, `mentions`, `export` → **need Basic+.** On Free they'll 403.
- Prices/quotas drift; treat this table as orientation and confirm current numbers
  at developer.x.com when budgeting.

**Auth models used** (see `xclient.py`):
- **OAuth 1.0a user context** (4 keys) — required for anything acting *as*
  @spaceshipalpha9 (all writes, `get_me`, media upload, profile edit).
- **OAuth 2.0 app-only bearer** — optional, read-only app context for public
  lookups.

**Endpoints wired** (v2 unless noted):
`create_tweet`, `delete_tweet`, `get_me`, `get_user`/`get_users`,
`get_users_tweets`, `get_users_mentions`, `get_tweet`, `like`/`unlike`,
`retweet`/`unretweet`, `follow_user`/`unfollow_user`; **v1.1**: `media_upload`,
`update_profile`.

**Not available via API** (don't expect them): pinning a tweet, editing a posted
tweet, setting avatar/banner via v2, native scheduling. Character budget is
X's *weighted* count — URLs = 23, CJK = 2 (approximated in `weighted_len()`).

## 6. Operating notes

- **Rehearse writes with `--dry-run`** before every real post/thread.
- **Rate limits:** the client sets `wait_on_rate_limit=True`, so it sleeps through
  429s rather than crashing. Threads pause ~1s between tweets.
- **Backups:** `xcli.py export` snapshots profile + up to ~3,200 tweets to
  `x/export/profile.json` (gitignored). Run it before any bulk delete.
- **Never** commit `.env` or `x/export/` (both gitignored). Keys live in `.env` /
  Google Secret Manager (project `stylelift`).
- **Scheduling:** X has no API scheduler on lower tiers — schedule from the repo
  (cron / GitHub Action invoking `xcli.py post`), the way `substack/schedule_drafts.py`
  handles Substack.
