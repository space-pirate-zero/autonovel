# The Last Human CEO — Substack Daily Drip

One episode per day for 29 days. Every post **and** every Note carries the
**Kindle + paperback + web** links and hashtags — the whole point is to drive
listens *and* book sales, daily.

## What's here

| Path | What it is |
|---|---|
| `gen_posts.py` | Generates everything below from `hooks.json`, chapter titles, and the host-intros. |
| `posts/day_NN_epNN.md` | 29 ready-to-publish Substack **posts** (title, subtitle, SPZ-voice recap, listen + read links, audiogram, hashtags). |
| `notes/note_NN.md` | 29 short Substack **Notes** (for the Notes feed) — hook + all three links + hashtags. |
| `SCHEDULE.md` | The calendar: which episode publishes which day. |
| `schedule.csv` | Same, as data (date, time, ep, title, subtitle, post file). |
| `push_and_schedule.py` | Optional automation: create all 29 as **drafts**, then auto-publish one/day. |

Regenerate anytime (e.g. to change the start date):

```bash
uv run python substack/gen_posts.py --start 2026-07-14 --time 09:00
```

## Every post includes, every day

- ▶️ **Listen free** — Apple Podcasts · Spotify · `lasthumanceo.com/#epNN`
- 📕 **Read it** — [Kindle](https://www.amazon.com/dp/B0H5YVJY3Z) · [Paperback](https://www.amazon.com/dp/B0H6LCDJ9H)
- the chapter's **audiogram** (drop in `…/video/teaser_epNN.mp4` as the post video)
- an SPZ-voice recap (the chapter's host-intro) + the one-line hook as the subtitle
- the standard footer + hashtag bank

## Publishing it — two ways

### A) Manual (no credentials, most control) — recommended to start
1. In Substack, **New post** → paste the body from `posts/day_01_ep01.md`
   (title + subtitle are the first two lines of the frontmatter).
2. Add the chapter audiogram video (`teaser_epNN.mp4`) at the top.
3. **Schedule** it for the date in `SCHEDULE.md`, then repeat — or batch a week at a time.
4. Post the matching `notes/note_NN.md` to **Notes** on the same morning.

Substack's scheduler will then release one per day on its own.

### B) Automated (unofficial API — creates drafts + schedules)
Uses the `python-substack` library and your logged-in session. It only creates
**drafts** unless you pass `--schedule`. Put your session in the gitignored
repo-root `.env`:

```bash
SUBSTACK_PUBLICATION_URL="https://spacepiratezero.substack.com"
SUBSTACK_COOKIES_STRING='<your substack session cookie string>'
```

Then:

```bash
# 1. sanity check the connection (no writes)
uv run --with python-substack python substack/push_and_schedule.py --test
# 2. trial one draft
uv run --with python-substack python substack/push_and_schedule.py --limit 1
# 3. create all 29 drafts, then schedule one per day at 9am ET
uv run --with python-substack python substack/push_and_schedule.py \
      --schedule --start 2026-07-14 --time 09:00 --tz -04:00
```

Draft ids are saved to `draft_ids.json` so re-runs and scheduling line up.

> ⚠️ This is an **unofficial** API. Substack can change or rate-limit it; the
> script backs off on 429s. Session cookies are credentials — keep them in `.env`
> (git-ignored), never commit them. If in doubt, use the manual path (A).

## Cadence tip

Post the **email/post** in the morning and drop the **Note** an hour or two later
(Notes drive discovery; posts drive the email list). Pin the Day-1 post. When the
run ends (Day 29 = the Coda), pin a "start from Episode 1" post to loop new subs in.
