#!/usr/bin/env python3
"""
gen_posts.py — a 29-day, one-episode-per-day Substack drip for The Last Human CEO.

For each chapter it writes a ready-to-publish Substack POST and a short Substack
NOTE, both in SPZ voice, both carrying the Kindle + paperback + web links and
hashtags every single day. Also emits a dated SCHEDULE so you can load them into
Substack's scheduler (one per day).

Outputs (under substack/):
  posts/day_NN_epNN.md   full post: title, subtitle, body, links, hashtags
  notes/note_NN.md       short Substack Note for the Notes feed
  SCHEDULE.md            human-readable calendar
  schedule.csv           date,ep,title,subtitle,post_file  (for import/tracking)

Run:  uv run python substack/gen_posts.py --start 2026-07-14 --time 09:00
"""
import argparse, csv, json
from datetime import date, datetime, timedelta
from pathlib import Path

BOOK = Path(__file__).resolve().parent.parent
SUB = BOOK / "substack"
CH = BOOK / "chapters"
INTROS = BOOK / "audiobook" / "intros"
HOOKS = json.load(open(BOOK / "social" / "hooks.json"))
_TLDR_FILE = BOOK / "substack" / "tldr.json"
TLDR = json.loads(_TLDR_FILE.read_text()) if _TLDR_FILE.exists() else {}
N_EPISODES = 29

# --- canonical links (source of truth: publishing/gen_site.py) ---
SITE = "https://lasthumanceo.com"
SUBSTACK = "https://spacepiratezero.substack.com"     # the Substack podcast (native listen)
APPLE = "https://podcasts.apple.com/us/podcast/the-last-human-ceo/id6790448408"
SPOTIFY = "https://open.spotify.com/show/033OSpl5KjvWx07upDLZ8M"
KINDLE = "https://www.amazon.com/dp/B0H5YVJY3Z"      # Kindle e-book
PAPERBACK = "https://www.amazon.com/dp/B0H6LCDJ9H"   # paperback
GCS = "https://storage.googleapis.com/spz-podcasts/the-last-human-ceo"

HASHTAGS = ("#audiobook #podcast #audiodrama #scifi #AI #cyberpunk #darkcomedy "
            "#fiction #SpacePirateZero #TheLastHumanCEO")
NOTE_TAGS = "#audiobook #podcast #scifi #AI #TheLastHumanCEO"

# ep01 has no host-intro file (the show opens on it) — craft a reader-facing recap.
EP1_RECAP = (
    "Meet Prescott “Cope” Mercer IV — the last flesh-and-blood CEO in the "
    "Fortune 100. Charming, coke-addled, fourth-generation Atlanta money, and utterly "
    "convinced that being obeyed is the same thing as being loved. It's 2027, the boards "
    "are quietly swapping their humans for cheaper, scandal-proof AI, and tonight they "
    "hand Cope a crystal award for being the last of his kind. He holds it to the light "
    "and calls it a beginning. Stay close to the set."
)


def clean_title(n):
    p = (CH / "ch_coda.md") if n == N_EPISODES else (CH / f"ch_{n:02d}.md")
    head = p.read_text().splitlines()[0].lstrip("# ").strip()
    return head.split("—", 1)[1].strip() if "—" in head else head


def recap(n):
    f = INTROS / f"ch{n:02d}.txt"
    if n == 1:
        return EP1_RECAP
    if f.exists():
        return f.read_text().strip()
    return HOOKS.get(str(n), "")


def ep_web(n):    # deep-link to the episode on the site
    return f"{SITE}/#ep{n}"


def teaser(n):
    return f"{GCS}/video/teaser_ep{n:02d}.mp4"


def post_md(n, when, teaser_no):
    t = clean_title(n)
    hook = HOOKS.get(str(n), "")
    entry = TLDR.get(str(n), {})
    tldr = entry.get("tldr") or recap(n)
    moral = entry.get("moral", "")
    moral_block = f"\n**The moral of the story:** {moral}\n" if moral else ""
    body = f"""---
title: "EP {n:02d} — {t}"
subtitle: "{hook}"
scheduled: {when.isoformat()}
audiogram: {teaser(n)}
---

🎧 **Listen to Episode {n:02d}** — [on Substack]({SUBSTACK}) · [Apple Podcasts]({APPLE}) · [Spotify]({SPOTIFY}) · [web player]({ep_web(n)})

---

## TLDR

{tldr}
{moral_block}
---

### Sources & links
🎧 **Listen:** [Substack]({SUBSTACK}) · [Apple Podcasts]({APPLE}) · [Spotify]({SPOTIFY}) · [web player]({ep_web(n)})
📖 **Read the book:** [Kindle]({KINDLE}) · [Paperback]({PAPERBACK})
🌐 **More:** [{SITE.replace('https://','')}]({SITE}) · [press kit]({SITE}/press)

*THE LAST HUMAN CEO — a full-cast audiobook by **Space Pirate Zero**, made at Spaceship Alpha 9. New episode every weekday.*

*Signal finds signal.*

{HASHTAGS}
"""
    return body


def note_md(n, when):
    t = clean_title(n)
    hook = HOOKS.get(str(n), "")
    last = " — the finale." if n == N_EPISODES else ""
    return f"""[schedule: {when.isoformat()}]

🎙️ EP {n:02d} — *{t}* is live{last}

{hook}

🎧 Listen on Substack: {SUBSTACK}
▶️ Apple: {APPLE}
🎧 Spotify: {SPOTIFY}
🌐 Web: {ep_web(n)}
📕 Kindle: {KINDLE}
📖 Paperback: {PAPERBACK}

{NOTE_TAGS}
"""


def weekday_dates(start, count):
    """`count` consecutive weekdays (Mon–Fri) starting on/after `start`."""
    out, d = [], start
    while len(out) < count:
        if d.weekday() < 5:          # Mon=0 … Fri=4  (skip Sat/Sun)
            out.append(d)
        d += timedelta(days=1)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", required=True, help="YYYY-MM-DD, publish date for EP 01")
    ap.add_argument("--time", default="09:00", help="HH:MM local publish time")
    args = ap.parse_args()
    d0 = date.fromisoformat(args.start)
    hh, mm = (int(x) for x in args.time.split(":"))

    (SUB / "posts").mkdir(parents=True, exist_ok=True)
    (SUB / "notes").mkdir(parents=True, exist_ok=True)
    dates = weekday_dates(d0, N_EPISODES)          # weekdays only — skip Sat/Sun
    rows = []
    for n in range(1, N_EPISODES + 1):
        when = datetime.combine(dates[n - 1], datetime.min.time()).replace(hour=hh, minute=mm)
        (SUB / "posts" / f"day_{n:02d}_ep{n:02d}.md").write_text(post_md(n, when, n))
        (SUB / "notes" / f"note_{n:02d}.md").write_text(note_md(n, when))
        rows.append((when.date().isoformat(), args.time, n, f"EP {n:02d} — {clean_title(n)}",
                     HOOKS.get(str(n), ""), f"posts/day_{n:02d}_ep{n:02d}.md"))

    with open(SUB / "schedule.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "time", "ep", "title", "subtitle", "post_file"])
        w.writerows(rows)

    lines = ["# The Last Human CEO — Substack Daily Drip\n",
             f"One episode per **weekday** (Mon–Fri, skips weekends), {rows[0][0]} → {rows[-1][0]} "
             f"at {args.time} local. Every post + note carries the Apple, Spotify, web, Kindle, "
             "and paperback links.\n",
             "| Date | EP | Title | Post |", "|---|---|---|---|"]
    for r in rows:
        lines.append(f"| {r[0]} | {r[2]:02d} | {r[3]} | `{r[5]}` |")
    (SUB / "SCHEDULE.md").write_text("\n".join(lines) + "\n")
    print(f"built {len(rows)} posts + notes  ·  {rows[0][0]} → {rows[-1][0]}  ·  {args.time} local")
    print(f"  -> substack/posts/  substack/notes/  SCHEDULE.md  schedule.csv")


if __name__ == "__main__":
    main()
