#!/usr/bin/env python3
"""Assemble the 30 Substack draft posts (.md) in FABLE format from series_data.py
(title/eq/tie-in/teaser) + per-day fables in substack/fables/day_NN.md.

A fable file is plain prose, then a final line:  MORAL: <one or two sentences>

Run: uv run python substack/build_posts.py  ->  substack/posts/day_NN.md"""
import sys
from pathlib import Path
HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from series_data import SERIES, BUY_KINDLE, BUY_PAPERBACK, SUBSCRIBE   # noqa
POSTS = HERE / "posts"; POSTS.mkdir(exist_ok=True)
FABLES = HERE / "fables"

BUY_BAR = f"📕 **Read the whole field manual →** [Kindle]({BUY_KINDLE}) · [Paperback]({BUY_PAPERBACK})"


def load_fable(n):
    f = FABLES / f"day_{n:02d}.md"
    if not f.exists():
        return None, None
    moral = ""
    body = []
    for line in f.read_text().strip().split("\n"):
        if line.strip().upper().startswith("MORAL:"):
            moral = line.split(":", 1)[1].strip()
        else:
            body.append(line)
    return "\n".join(body).strip(), moral


def post(d):
    fable, moral = load_fable(d["n"])
    L = [BUY_BAR, "", f"![Day {d['n']}](cards/day_{d['n']:02d}.png)", "",
         f"# Day {d['n']}/30 — {d['title']}",
         f"*A fable from the field manual · {d['source']}*", ""]
    if fable:
        L += [fable, "", "---", ""]
    L += ["**What it means.** " + d["nugget"], ""]
    if d.get("eq"):
        L += ["## The equation", "", f"$$ {d['eq']} $$", ""]
        if d.get("bench"):
            L += [d["bench"], ""]
    if moral:
        L += [f"**The moral of the story is:** {moral}", ""]
    L += ["---", "",
          (f"📕 **Read the field manual →** [Kindle]({BUY_KINDLE}) · [Paperback]({BUY_PAPERBACK})"),
          "", (f"**Tomorrow → {d['teaser']}**" if d["n"] < 30 else f"**{d['teaser']}**"),
          "", f"*[Subscribe]({SUBSCRIBE}) — one fable a day for 30 days.*"]
    return "\n".join(L) + "\n"


def main():
    for d in SERIES:
        (POSTS / f"day_{d['n']:02d}.md").write_text(post(d))
    have = len(list(FABLES.glob("day_*.md")))
    print(f"Wrote {len(SERIES)} posts -> {POSTS}  ({have}/30 fables present)")


if __name__ == "__main__":
    main()
