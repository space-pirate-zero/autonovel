#!/usr/bin/env python3
"""Assemble the 30 Substack draft posts (.md) from series_data.py + the template.
Run: uv run python substack/build_posts.py  ->  substack/posts/day_NN.md"""
import sys
from pathlib import Path
HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from series_data import SERIES, BUY_KINDLE, BUY_PAPERBACK, SUBSCRIBE   # noqa
POSTS = HERE / "posts"; POSTS.mkdir(exist_ok=True)

BUY_BAR = f"📕 **Read the whole field manual →** [Kindle]({BUY_KINDLE}) · [Paperback]({BUY_PAPERBACK})"

def post(d):
    L = [BUY_BAR, "", f"![Day {d['n']}](cards/day_{d['n']:02d}.png)", "",
         f"# Day {d['n']}/30 — {d['title']}", f"*{d['source']}*", "",
         "## The nugget", d["nugget"], ""]
    if d.get("eq"):
        L += ["## The equation", "", f"$$ {d['eq']} $$", ""]
        if d.get("bench"):
            L += [d["bench"], ""]
    if d.get("broadcast"):
        L += ["## From the Broadcast", d["broadcast"], ""]
    elif d.get("bench") and not d.get("eq"):
        L += [d["bench"], ""]
    # SPZ closer as blockquote
    L += ["## SPZ closer", "", "> " + d["closer"].replace("\n", "\n> "), ""]
    L += ["---", "",
          f"📕 **If this hit, the book has the rest.** → [Kindle]({BUY_KINDLE}) · [Paperback]({BUY_PAPERBACK})",
          "", f"**Tomorrow → {d['teaser']}**" if d["n"] < 30 else
          f"**That's the series. {d['teaser']}**",
          "", f"*[Subscribe]({SUBSCRIBE}) so you don't miss the next one.*"]
    return "\n".join(L) + "\n"

def main():
    for d in SERIES:
        (POSTS / f"day_{d['n']:02d}.md").write_text(post(d))
    print(f"Wrote {len(SERIES)} posts -> {POSTS}")

if __name__ == "__main__":
    main()
