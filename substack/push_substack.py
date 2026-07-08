#!/usr/bin/env python3
"""
Create the 30 posts as DRAFTS in Substack via the (unofficial) python-substack lib.
Creates drafts only — never publishes or schedules.

AUTH (env): set your publication + a session, then run.
  export SUBSTACK_PUBLICATION_URL="https://YOURNAME.substack.com"
  # preferred: a session cookie string (Settings export, or browser cookie)
  export SUBSTACK_COOKIES_STRING='...'
  # OR email+password (less safe):
  export SUBSTACK_EMAIL="you@example.com"; export SUBSTACK_PASSWORD="..."

USAGE:
  uv run python substack/push_substack.py --test        # connect only, no writes
  uv run python substack/push_substack.py --limit 1      # push only Day 1 (trial)
  uv run python substack/push_substack.py                # push all 30 drafts
  uv run python substack/push_substack.py --native-math  # experimental Substack LaTeX node

Notes:
- Buy links come from series_data.py (placeholders until the book is live).
- Equation appears as the branded hero card (rendered LaTeX) + an in-body block.
"""
import argparse, os, sys
from pathlib import Path
HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
try:
    from dotenv import load_dotenv
    load_dotenv(HERE.parent / ".env")   # read SUBSTACK_* from gitignored .env
except Exception:
    pass
from series_data import SERIES, BUY_KINDLE, BUY_PAPERBACK, SUBSCRIBE  # noqa

CARDS = HERE / "cards"


def connect():
    from substack import Api
    pub = os.environ.get("SUBSTACK_PUBLICATION_URL")
    if not pub:
        sys.exit("Set SUBSTACK_PUBLICATION_URL (e.g. https://you.substack.com)")
    cpath = os.environ.get("SUBSTACK_COOKIES_PATH")
    cookies = os.environ.get("SUBSTACK_COOKIES_STRING")
    if cpath:
        api = Api(cookies_path=cpath, publication_url=pub)
    elif cookies:
        api = Api(cookies_string=cookies, publication_url=pub)
    elif os.environ.get("SUBSTACK_EMAIL"):
        api = Api(email=os.environ["SUBSTACK_EMAIL"],
                  password=os.environ["SUBSTACK_PASSWORD"], publication_url=pub)
    else:
        sys.exit("Set SUBSTACK_COOKIES_STRING or SUBSTACK_EMAIL/PASSWORD")
    return api


from build_posts import load_fable   # reuse the fable+moral loader

BUY_BAR = (f"📕 **Read the whole field manual →** "
           f"[Kindle]({BUY_KINDLE}) · [Paperback]({BUY_PAPERBACK})")


def to_markdown(d, card_url, native_math):
    """Assemble the FABLE-format post body as Markdown for Post.from_markdown().
    Mirrors build_posts.py. Title/subtitle are set on the Post, not in the body.
    card_url is the already-uploaded Substack image URL (remote https)."""
    fable, moral = load_fable(d["n"])
    L = [BUY_BAR, ""]
    if card_url:
        L += [f"![Day {d['n']}: {d['title']}]({card_url})", ""]
    if fable:
        L += [fable, "", "---", ""]
    L += ["**What it means.** " + d["nugget"], ""]
    if d.get("eq"):
        L += ["## The equation", ""]
        if native_math:
            L += [f"$$ {d['eq']} $$", ""]
        else:
            # fenced code block -> Substack codeBlock node (clean "LaTeX source" look)
            L += ["```latex", d["eq"], "```", ""]
        if d.get("bench"):
            L += [d["bench"], ""]
    if d.get("broadcast"):
        L += ["## From the Broadcast", "", d["broadcast"], ""]
    if moral:
        L += [f"**The moral of the story is:** {moral}", ""]
    L += ["---", "", BUY_BAR, "",
          (f"**Tomorrow → {d['teaser']}**" if d["n"] < 30 else f"**{d['teaser']}**")]
    return "\n".join(L) + "\n"


def build(api, d, native_math):
    from substack.post import Post
    uid = api.get_user_id()
    post = Post(title=f"Day {d['n']}/30 — {d['title']}",
                subtitle=f"A fable from the field manual · {d['source']}",
                user_id=uid, audience="everyone")
    # Pre-upload the hero card and embed the remote URL (from_markdown mangles
    # absolute local paths by stripping the leading slash, so upload it ourselves).
    card_url = None
    card = CARDS / f"day_{d['n']:02d}.png"
    if card.exists():
        src = api.get_image(str(card))
        card_url = src.get("url") or src.get("href") if isinstance(src, dict) else src
    post.from_markdown(to_markdown(d, card_url, native_math), api=api)
    post.subscribe_with_caption("Subscribe — one fable a day for 30 days.")
    return post.get_draft()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--start", type=int, default=1, help="1-based day to start from")
    ap.add_argument("--delay", type=float, default=8.0, help="seconds between posts")
    ap.add_argument("--native-math", action="store_true")
    a = ap.parse_args()

    api = connect()
    print("Connected. user_id =", api.get_user_id(),
          "| publication =", os.environ.get("SUBSTACK_PUBLICATION_URL", "?"))
    if a.test:
        print("Test OK — no drafts created.")
        return

    import time
    days = SERIES[a.start - 1:]
    if a.limit:
        days = days[:a.limit]
    made = 0
    for i, d in enumerate(days):
        body = build(api, d, a.native_math)
        # retry on 429 (Substack rate limit) with exponential backoff
        for attempt in range(6):
            try:
                res = api.post_draft(body)
                break
            except Exception as e:
                if "429" in str(e) and attempt < 5:
                    wait = a.delay * (2 ** attempt)
                    print(f"    429 rate-limited; backing off {wait}s ...")
                    time.sleep(wait)
                    continue
                raise
        did = res.get("id") if isinstance(res, dict) else res
        made += 1
        print(f"  draft created: Day {d['n']:02d} — {d['title']}  (id {did})")
        if i != len(days) - 1:
            time.sleep(a.delay)   # throttle between posts
    print(f"\nDone. {made} drafts created (unpublished). Review/schedule in Substack.")


if __name__ == "__main__":
    main()
