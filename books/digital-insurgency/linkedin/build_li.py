#!/usr/bin/env python3
"""Generate 30 LinkedIn posts — one per Digital Insurgency Substack fable.

Each post: a hook, the day's lesson, a link to that day's Substack article,
and a link to the book on Amazon. Pulls copy from substack/series_data.py
(title/nugget/teaser) + the per-day MORAL from substack/fables, and the
article slugs from linkedin_slugs.json.

Run: uv run python linkedin/build_li.py
Out: linkedin/posts/day_NN.txt  +  linkedin/ALL_POSTS.md (for review)
"""
import json, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SUB = ROOT / "substack"
sys.path.insert(0, str(SUB))
from series_data import SERIES, BUY_KINDLE        # noqa
from build_posts import load_fable                # noqa

OUT = Path(__file__).parent / "posts"
OUT.mkdir(exist_ok=True)
SLUGS = json.load(open(ROOT / "linkedin_slugs.json"))
BOOK = BUY_KINDLE
PUB = "https://spacepiratezero.substack.com/p/"

BOOK_TITLE = ("DIGITAL INSURGENCY: A Field Manual for Smuggling Authenticity "
              "Past the Corporate Immune System")
HASHTAGS = "#AI #FutureOfWork #Authenticity #Leadership #DigitalInsurgency"


def md_strip(text):
    # LinkedIn shows markdown literally — remove emphasis markers
    text = text.replace("**", "").replace("*", "")
    return text


def first_sentence(text):
    text = md_strip(" ".join(text.split()))
    m = re.search(r"(.+?[.!?])(\s|$)", text)
    return m.group(1).strip() if m else text.strip()


def trim(text, n=300):
    text = md_strip(" ".join(text.split()))
    return text if len(text) <= n else text[:n].rsplit(" ", 1)[0] + "…"


def post(d):
    n = d["n"]
    art = PUB + SLUGS[str(n)]["slug"]
    _, moral = load_fable(n)
    moral = md_strip(moral) if moral else moral
    hook = first_sentence(d["nugget"])
    # body: the rest of the nugget, trimmed, as the substance
    rest = d["nugget"][len(hook):].strip()
    body = trim(rest, 320) if rest else ""
    L = [hook]
    if body:
        L += ["", body]
    if moral:
        L += ["", f"The moral of the story: {moral}"]
    L += ["",
          f"📖 Day {n}/30 of my fable series — “{d['title']}”. "
          f"A 2-minute read from the field:",
          art,
          "",
          f"📕 The book it's smuggled out of — {BOOK_TITLE}:",
          BOOK,
          "",
          HASHTAGS]
    return "\n".join(L) + "\n"


def main():
    allmd = ["# 30 LinkedIn posts — Digital Insurgency series\n"]
    for d in SERIES:
        txt = post(d)
        (OUT / f"day_{d['n']:02d}.txt").write_text(txt)
        allmd += [f"\n---\n\n## Day {d['n']}/30 — {d['title']}  "
                  f"(chars: {len(txt)})\n\n```\n{txt}```\n"]
    (Path(__file__).parent / "ALL_POSTS.md").write_text("\n".join(allmd))
    print(f"Wrote {len(SERIES)} LinkedIn posts -> {OUT}")
    print("Review file: linkedin/ALL_POSTS.md")


if __name__ == "__main__":
    main()
