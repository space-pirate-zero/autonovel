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
from series_data import SERIES, BUY_KINDLE, BUY_PAPERBACK, SUBSCRIBE  # noqa

CARDS = HERE / "cards"


def connect():
    from substack import Api
    pub = os.environ.get("SUBSTACK_PUBLICATION_URL")
    if not pub:
        sys.exit("Set SUBSTACK_PUBLICATION_URL (e.g. https://you.substack.com)")
    cookies = os.environ.get("SUBSTACK_COOKIES_STRING")
    if cookies:
        api = Api(cookies_string=cookies, publication_url=pub)
    elif os.environ.get("SUBSTACK_EMAIL"):
        api = Api(email=os.environ["SUBSTACK_EMAIL"],
                  password=os.environ["SUBSTACK_PASSWORD"], publication_url=pub)
    else:
        sys.exit("Set SUBSTACK_COOKIES_STRING or SUBSTACK_EMAIL/PASSWORD")
    return api


def buy_bar(post, tail=False):
    msg = ("If this hit, the book has the rest. → " if tail
           else "📕 Read the whole field manual → ")
    post.add_complex_text([
        {"content": msg},
        {"content": "Kindle", "marks": [{"type": "link", "href": BUY_KINDLE}]},
        {"content": " · "},
        {"content": "Paperback", "marks": [{"type": "link", "href": BUY_PAPERBACK}]},
    ])


def build(api, d, native_math):
    from substack.post import Post
    uid = api.get_user_id()
    post = Post(title=f"Day {d['n']}/30 — {d['title']}",
                subtitle=d["source"], user_id=uid, audience="everyone")
    buy_bar(post)

    # hero card (rendered-LaTeX brand image)
    card = CARDS / f"day_{d['n']:02d}.png"
    if card.exists():
        src = api.get_image(str(card))
        if isinstance(src, dict):
            src = src.get("url") or src.get("href")
        post.captioned_image(src=src, alt=f"Day {d['n']}: {d['title']}")

    post.heading("The nugget", 2)
    post.paragraph(d["nugget"])

    if d.get("eq"):
        post.heading("The equation", 2)
        if native_math:
            # experimental: Substack inline LaTeX node (test on --limit 1 first)
            post.add({"type": "paragraph",
                      "content": [{"type": "latex", "attrs": {"value": d["eq"]}}]})
        else:
            post.code_block(d["eq"])  # the LaTeX, copyable (card shows it rendered)
        if d.get("bench"):
            post.paragraph(d["bench"])

    if d.get("broadcast"):
        post.heading("From the Broadcast", 2)
        post.paragraph(d["broadcast"])

    post.heading("SPZ closer", 2)
    post.blockquote(d["closer"])

    post.horizontal_rule()
    buy_bar(post, tail=True)
    post.paragraph(("Tomorrow → " + d["teaser"]) if d["n"] < 30
                   else ("That's the series. " + d["teaser"]))
    post.subscribe_with_caption("Subscribe so you don't miss the next one.")
    return post.get_draft()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--test", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--native-math", action="store_true")
    a = ap.parse_args()

    api = connect()
    print("Connected. user_id =", api.get_user_id(),
          "| publication =", api.get_publication_url() if hasattr(api, "get_publication_url") else "?")
    if a.test:
        print("Test OK — no drafts created.")
        return

    days = SERIES[:a.limit] if a.limit else SERIES
    for d in days:
        body = build(api, d, a.native_math)
        res = api.post_draft(body)
        did = res.get("id") if isinstance(res, dict) else res
        print(f"  draft created: Day {d['n']:02d} — {d['title']}  (id {did})")
    print(f"\nDone. {len(days)} drafts created (unpublished). Review/schedule in Substack.")


if __name__ == "__main__":
    main()
