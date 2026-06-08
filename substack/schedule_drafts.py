#!/usr/bin/env python3
"""Schedule the 30 Digital Insurgency fable drafts to auto-publish, one per day.

Auth: same as push_substack.py (SUBSTACK_COOKIES_PATH + SUBSTACK_PUBLICATION_URL).

  SUBSTACK_COOKIES_PATH=substack_cookies.json \
    uv run python substack/schedule_drafts.py --start 2026-06-08 --time 09:00 --tz -04:00

Flags:
  --start YYYY-MM-DD  first publish date (Day 1)        [required]
  --time HH:MM        local publish time each day        [default 09:00]
  --tz  ±HH:MM        UTC offset for that time           [default -04:00 = US Eastern DST]
  --delay SECONDS     throttle between API calls         [default 8]
  --dry-run           print the schedule, change nothing
"""
import argparse, os, sys, time
from datetime import datetime, timedelta, timezone

# Day N -> draft id (created by push_substack.py)
DRAFT_IDS = {
    1: 201082476, 2: 201082526, 3: 201082528, 4: 201082530, 5: 201082531,
    6: 201082534, 7: 201082536, 8: 201082558, 9: 201082568, 10: 201082583,
    11: 201082591, 12: 201082603, 13: 201082610, 14: 201082627, 15: 201082637,
    16: 201082651, 17: 201082666, 18: 201082683, 19: 201082704, 20: 201082716,
    21: 201082726, 22: 201082738, 23: 201082750, 24: 201082762, 25: 201082777,
    26: 201082796, 27: 201082807, 28: 201082819, 29: 201082834, 30: 201082846,
}


def connect():
    from substack import Api
    pub = os.environ.get("SUBSTACK_PUBLICATION_URL") or "https://spacepiratezero.substack.com"
    cpath = os.environ.get("SUBSTACK_COOKIES_PATH")
    if not cpath:
        sys.exit("Set SUBSTACK_COOKIES_PATH=substack_cookies.json")
    return Api(cookies_path=cpath, publication_url=pub)


def main():
    try:
        from dotenv import load_dotenv
        load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", required=True, help="YYYY-MM-DD for Day 1")
    ap.add_argument("--time", default="09:00", help="HH:MM local")
    ap.add_argument("--tz", default="-04:00", help="UTC offset, e.g. -04:00")
    ap.add_argument("--from-day", type=int, default=1)
    ap.add_argument("--to-day", type=int, default=30)
    ap.add_argument("--delay", type=float, default=8.0)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    sign = 1 if a.tz[0] == "+" else -1
    th, tm = a.tz[1:].split(":")
    tz = timezone(sign * timedelta(hours=int(th), minutes=int(tm)))
    hh, mm = a.time.split(":")
    base = datetime.strptime(a.start, "%Y-%m-%d").replace(
        hour=int(hh), minute=int(mm), second=0, microsecond=0, tzinfo=tz)

    api = None if a.dry_run else connect()
    if not a.dry_run:
        print("Connected. user_id =", api.get_user_id())

    s = None if a.dry_run else api._session
    bse = None if a.dry_run else api.publication_url
    days = [n for n in range(a.from_day, a.to_day + 1)]
    for i, n in enumerate(days):
        dt = base + timedelta(days=n - 1)
        utc_iso = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        did = DRAFT_IDS[n]
        when = dt.strftime("%a %Y-%m-%d %H:%M %z") + f"  ({utc_iso})"
        if a.dry_run:
            print(f"  Day {n:02d} (id {did}) -> {when}")
            continue
        # POST /drafts/{id}/scheduled_release  {trigger_at, post_audience, email_audience}
        for attempt in range(6):
            r = s.post(f"{bse}/drafts/{did}/scheduled_release",
                       json={"trigger_at": utc_iso,
                             "post_audience": "everyone",
                             "email_audience": "everyone"})
            if r.status_code == 429 and attempt < 5:
                w = a.delay * (2 ** attempt)
                print(f"    429; backing off {w}s ...")
                time.sleep(w)
                continue
            if r.status_code != 200:
                raise SystemExit(f"Day {n:02d} failed: {r.status_code} {r.text[:200]}")
            break
        print(f"  scheduled Day {n:02d} (id {did}) -> {when}")
        if i != len(days) - 1:
            time.sleep(a.delay)

    print("\nDone. 30 posts scheduled." if not a.dry_run
          else "\nDry run only — nothing changed.")


if __name__ == "__main__":
    main()
