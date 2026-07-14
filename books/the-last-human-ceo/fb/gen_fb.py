#!/usr/bin/env python3
"""
gen_fb.py — a 29-post Facebook drip for The Last Human CEO, mirroring the Substack
schedule (one per weekday). Same TLDRs, full SPZ brand voice, growth hashtags,
links to Substack (deep-linked per episode) + Apple + Spotify + web, and each
post paired with that episode's branded image card.

Facebook has no usable API here and blocks automation, so this emits a
ready-to-schedule kit for Meta Business Suite Planner:
  fb/posts/day_NN_epNN.txt   the caption (plain text — FB doesn't do markdown)
  fb/SCHEDULE.md             date · image · caption file
  fb/schedule.csv            date,time,ep,image,caption_file

Run:  uv run python fb/gen_fb.py --start 2026-07-14 --time 09:00
"""
import argparse, csv, json
from datetime import date, datetime, timedelta
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
FB = BOOK / "fb"
CH = BOOK / "chapters"
SOC = BOOK / "social"
HOOKS = json.load(open(SOC / "hooks.json"))
TLDR = json.loads((BOOK / "substack" / "tldr.json").read_text())
SUB_EPS = json.loads((BOOK / "substack" / "substack_episodes.json").read_text())
N_EPISODES = 29

SITE = "https://lasthumanceo.com"
SUBSTACK = "https://spacepiratezero.substack.com"
APPLE = "https://podcasts.apple.com/us/podcast/the-last-human-ceo/id6790448408"
SPOTIFY = "https://open.spotify.com/show/033OSpl5KjvWx07upDLZ8M"
KINDLE = "https://www.amazon.com/dp/B0H5YVJY3Z"
PAPERBACK = "https://www.amazon.com/dp/B0H6LCDJ9H"

# growth-oriented hashtag bank for Facebook discovery
HASHTAGS = ("#audiobook #podcast #audiodrama #scifi #sciencefiction #cyberpunk #AI "
            "#artificialintelligence #darkcomedy #satire #fiction #booklovers #bookstagram "
            "#newpodcast #podcastrecommendations #SpacePirateZero #TheLastHumanCEO #SpaceshipAlpha9")


def clean_title(n):
    p = (CH / "ch_coda.md") if n == N_EPISODES else (CH / f"ch_{n:02d}.md")
    head = p.read_text().splitlines()[0].lstrip("# ").strip()
    return head.split("—", 1)[1].strip() if "—" in head else head


def card(n):   # branded image asset for this episode
    return f"social/img/ep_{n:02d}.jpg"


def caption(n):
    t = clean_title(n).upper()
    hook = HOOKS.get(str(n), "")
    e = TLDR.get(str(n), {})
    tldr = e.get("tldr", "")
    moral = e.get("moral", "")
    sub = SUB_EPS.get(str(n), SUBSTACK)
    last = "  🖤 THE FINALE." if n == N_EPISODES else ""
    return f"""🎙️ EP {n:02d} — {t}{last}

{hook}

{tldr}

🔑 The moral of the story: {moral}

━━━━━━━━━━━━━━
▶️ LISTEN FREE — a new episode every weekday:
🎧 Substack (listen + read): {sub}
🍎 Apple Podcasts: {APPLE}
🟢 Spotify: {SPOTIFY}
🌐 Web player: {SITE}/#ep{n}
📖 Read the book — Kindle: {KINDLE} · Paperback: {PAPERBACK}

A full-cast audiobook written, scored & voiced in-house at Spaceship Alpha 9.
Signal finds signal. 🖤

{HASHTAGS}"""


def weekday_dates(start, count):
    out, d = [], start
    while len(out) < count:
        if d.weekday() < 5:
            out.append(d)
        d += timedelta(days=1)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", required=True, help="YYYY-MM-DD for EP 01")
    ap.add_argument("--time", default="09:00")
    args = ap.parse_args()
    d0 = date.fromisoformat(args.start)
    (FB / "posts").mkdir(parents=True, exist_ok=True)
    dates = weekday_dates(d0, N_EPISODES)
    rows = []
    for n in range(1, N_EPISODES + 1):
        (FB / "posts" / f"day_{n:02d}_ep{n:02d}.txt").write_text(caption(n))
        rows.append((dates[n - 1].isoformat(), args.time, n, card(n), f"posts/day_{n:02d}_ep{n:02d}.txt"))
    with open(FB / "schedule.csv", "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", "time", "ep", "image", "caption_file"]); w.writerows(rows)
    lines = ["# The Last Human CEO — Facebook Daily Drip\n",
             f"One post per **weekday**, {rows[0][0]} → {rows[-1][0]} at {args.time} — mirrors the Substack schedule. "
             "Each post: full SPZ voice, the episode's branded image card, growth hashtags, and links to "
             "Substack (per-episode) + Apple + Spotify + web + the book.\n",
             "Schedule these in **Meta Business Suite → Planner** (bulk-friendly, native drip).\n",
             "| Date | EP | Image | Caption |", "|---|---|---|---|"]
    for r in rows:
        lines.append(f"| {r[0]} | {r[2]:02d} | `{r[3]}` | `{r[4]}` |")
    (FB / "SCHEDULE.md").write_text("\n".join(lines) + "\n")
    print(f"built {len(rows)} FB captions  ·  {rows[0][0]} → {rows[-1][0]}  ·  {args.time}")


if __name__ == "__main__":
    main()
