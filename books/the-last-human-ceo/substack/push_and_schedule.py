#!/usr/bin/env python3
"""
push_and_schedule.py — create the 29 daily posts as Substack DRAFTS, then
(optionally) schedule them to auto-publish one per day.

Uses the unofficial `python-substack` lib + your session (drafts only; never
publishes without --schedule). Mirrors the working flow in the repo-root
substack/ scripts. Run substack/gen_posts.py first to build posts/.

AUTH (put in the gitignored repo-root .env, or export):
  SUBSTACK_PUBLICATION_URL="https://spacepiratezero.substack.com"
  SUBSTACK_COOKIES_STRING='...'          # a logged-in session cookie string
  # or  SUBSTACK_COOKIES_PATH=substack_cookies.json
  # or  SUBSTACK_EMAIL=... SUBSTACK_PASSWORD=...   (less safe)

USAGE:
  uv run --with python-substack python substack/push_and_schedule.py --test
  uv run --with python-substack python substack/push_and_schedule.py --limit 1
  uv run --with python-substack python substack/push_and_schedule.py           # all 29 drafts
  uv run --with python-substack python substack/push_and_schedule.py \
        --schedule --start 2026-07-14 --time 09:00 --tz -04:00      # + auto-publish 1/day
"""
import argparse, json, os, sys, time, re
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
POSTS = sorted((HERE / "posts").glob("day_*.md"))
IMG = HERE.parent / "social" / "img"           # episode cards: ep_NN.jpg
IDS_FILE = HERE / "draft_ids.json"


def load_env():
    try:
        from dotenv import load_dotenv
        load_dotenv(HERE.parent.parent.parent / ".env")   # repo-root .env
    except Exception:
        pass


def connect():
    from substack import Api
    pub = os.environ.get("SUBSTACK_PUBLICATION_URL")
    if not pub:
        sys.exit("Set SUBSTACK_PUBLICATION_URL (e.g. https://spacepiratezero.substack.com)")
    if os.environ.get("SUBSTACK_COOKIES_PATH"):
        return Api(cookies_path=os.environ["SUBSTACK_COOKIES_PATH"], publication_url=pub)
    if os.environ.get("SUBSTACK_COOKIES_STRING"):
        return Api(cookies_string=os.environ["SUBSTACK_COOKIES_STRING"], publication_url=pub)
    if os.environ.get("SUBSTACK_EMAIL"):
        return Api(email=os.environ["SUBSTACK_EMAIL"], password=os.environ["SUBSTACK_PASSWORD"],
                   publication_url=pub)
    sys.exit("Set SUBSTACK_COOKIES_STRING / SUBSTACK_COOKIES_PATH / SUBSTACK_EMAIL+PASSWORD")


def parse_post(path):
    """Return (title, subtitle, ep_n, body_markdown) — strips YAML frontmatter
    and the self-note helper line."""
    text = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    fm, body = (m.group(1), m.group(2)) if m else ("", text)
    def field(k):
        mm = re.search(rf'^{k}:\s*"?(.*?)"?\s*$', fm, re.M)
        return mm.group(1) if mm else ""
    title, subtitle = field("title"), field("subtitle")
    ep = int(re.search(r"ep(\d+)", path.name).group(1))
    # drop the "(Chapter audiogram: ... drop it in ...)" note meant for manual use
    body = "\n".join(l for l in body.splitlines() if not l.startswith("*(Chapter audiogram:"))
    return title, subtitle, ep, body.strip() + "\n"


def build_draft(api, path):
    from substack.post import Post
    title, subtitle, ep, body = parse_post(path)
    post = Post(title=title, subtitle=subtitle, user_id=api.get_user_id(), audience="everyone")
    card = IMG / f"ep_{ep:02d}.jpg"
    if card.exists():
        src = api.get_image(str(card))
        url = (src.get("url") or src.get("href")) if isinstance(src, dict) else src
        if url:
            body = f"![EP {ep:02d}]({url})\n\n" + body
    post.from_markdown(body, api=api)
    post.subscribe_with_caption("Subscribe — a new episode every day.")
    return api.post_draft(post.get_draft())


def with_backoff(fn, delay):
    for attempt in range(6):
        try:
            return fn()
        except Exception as e:
            if "429" in str(e) and attempt < 5:
                w = delay * (2 ** attempt); print(f"    429; backing off {w}s ..."); time.sleep(w); continue
            raise


def main():
    load_env()
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true", help="connect only, no writes")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--delay", type=float, default=8.0)
    ap.add_argument("--schedule", action="store_true", help="also schedule auto-publish 1/day")
    ap.add_argument("--start", help="YYYY-MM-DD for EP 01 (with --schedule)")
    ap.add_argument("--time", default="09:00")
    ap.add_argument("--tz", default="-04:00", help="UTC offset, e.g. -04:00 (US Eastern DST)")
    a = ap.parse_args()

    api = connect()
    print("Connected. user_id =", api.get_user_id(), "| pub =", os.environ.get("SUBSTACK_PUBLICATION_URL"))
    if a.test:
        print("Test OK — no drafts created."); return

    posts = POSTS[:a.limit] if a.limit else POSTS
    ids = json.loads(IDS_FILE.read_text()) if IDS_FILE.exists() else {}
    for i, p in enumerate(posts):
        ep = int(re.search(r"ep(\d+)", p.name).group(1))
        res = with_backoff(lambda: build_draft(api, p), a.delay)
        did = res.get("id") if isinstance(res, dict) else res
        ids[str(ep)] = did
        print(f"  draft: EP {ep:02d}  (id {did})")
        IDS_FILE.write_text(json.dumps(ids, indent=1))
        if i != len(posts) - 1:
            time.sleep(a.delay)
    print(f"\n{len(posts)} drafts created. ids -> {IDS_FILE.name}")

    if a.schedule:
        if not a.start:
            sys.exit("--schedule needs --start YYYY-MM-DD")
        sign = 1 if a.tz[0] == "+" else -1
        th, tm = a.tz[1:].split(":")
        tz = timezone(sign * timedelta(hours=int(th), minutes=int(tm)))
        hh, mm = (int(x) for x in a.time.split(":"))
        base = datetime.strptime(a.start, "%Y-%m-%d").replace(hour=hh, minute=mm, tzinfo=tz)
        s, bse = api._session, api.publication_url
        for ep in sorted(int(k) for k in ids):
            dt = base + timedelta(days=ep - 1)
            utc = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
            did = ids[str(ep)]
            r = with_backoff(lambda: s.post(f"{bse}/drafts/{did}/scheduled_release",
                             json={"trigger_at": utc, "post_audience": "everyone",
                                   "email_audience": "everyone"}), a.delay)
            if getattr(r, "status_code", 200) not in (200, 201):
                sys.exit(f"EP {ep:02d} schedule failed: {r.status_code} {r.text[:160]}")
            print(f"  scheduled EP {ep:02d} -> {dt:%a %Y-%m-%d %H:%M %z}")
            time.sleep(a.delay)
        print(f"\nScheduled {len(ids)} posts, one per day from {a.start}.")


if __name__ == "__main__":
    main()
