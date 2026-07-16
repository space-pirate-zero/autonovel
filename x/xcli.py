#!/usr/bin/env python3
"""
xcli — command line for the @spaceshipalpha9 X profile: publish, read, manage.

Run through uv so Tweepy is present without polluting the core env:

    uv run --with tweepy python x/xcli.py <command> [...]

Every write command accepts --dry-run (prints the payload, touches no network,
needs no credentials) so you can rehearse a post or a thread before it's real.

PUBLISH
    post "text" [--media a.png b.jpg] [--reply-to ID] [--quote ID] [--split]
    thread "para one" "para two" ...          # explicit parts, one per arg
    thread --file notes.md [--number/--no-number]  # auto-split a file into a chain
    reply ID "text" [--media ...]

READ
    whoami
    profile [@handle] [--json]                # bio + follower/tweet counts
    read [@handle] [-n 20] [--no-replies] [--no-retweets] [--json]
    tweet ID [--json]
    mentions [-n 20] [--json]
    export [--out x/export/profile.json] [--max 3200]   # full local backup

MANAGE
    delete ID
    like ID [--off]
    retweet ID [--off]
    follow @handle [--off]
    set-profile [--name N] [--bio B] [--url U] [--location L]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from xclient import XClient, XError, split_thread, weighted_len  # noqa: E402


def _client(args) -> XClient:
    return XClient(dry_run=getattr(args, "dry_run", False),
                   handle=getattr(args, "handle", None))


def _emit(obj, as_json: bool):
    if as_json:
        print(json.dumps(obj, indent=2, default=str))
        return
    if isinstance(obj, list):
        for row in obj:
            _print_tweet(row)
    else:
        _print_tweet(obj)


def _print_tweet(t: dict):
    when = t.get("created_at") or ""
    metrics = ""
    if t.get("likes") is not None:
        metrics = f"  ♥{t['likes']} ⟳{t['retweets']} 💬{t['replies']}"
    head = f"[{t['id']}] @{t.get('author') or '?'} {when}{metrics}"
    print(head)
    print("  " + (t["text"] or "").replace("\n", "\n  "))
    print(f"  {t['url']}\n")


# --- publish -------------------------------------------------------------
def cmd_post(args):
    c = _client(args)
    text = args.text
    if args.split or weighted_len(text) > 280:
        parts = split_thread(text, number=not args.no_number)
        if len(parts) > 1:
            print(f"Text is {weighted_len(text)} chars → posting as {len(parts)}-tweet thread.")
            for p in c.thread(parts, media_first=args.media):
                print(f"  ✔ {p.url}")
            return
    p = c.post(text, media=args.media, reply_to=args.reply_to, quote=args.quote)
    print(f"✔ posted: {p.url}")


def cmd_thread(args):
    c = _client(args)
    if args.file:
        parts = split_thread(Path(args.file).read_text(), number=not args.no_number)
    else:
        parts = [p for p in args.parts if p.strip()]
        if args.number and len(parts) > 1:
            n = len(parts)
            parts = [f"{p} ({i}/{n})" for i, p in enumerate(parts, 1)]
    if not parts:
        sys.exit("Nothing to post (empty thread).")
    over = [(i, weighted_len(p)) for i, p in enumerate(parts, 1) if weighted_len(p) > 280]
    if over:
        sys.exit(f"These parts exceed 280 chars: {over}. Use --file to auto-split.")
    print(f"Posting {len(parts)}-tweet thread:")
    for p in c.thread(parts, media_first=args.media):
        print(f"  ✔ {p.url}")


def cmd_reply(args):
    c = _client(args)
    p = c.reply(args.id, args.text, media=args.media)
    print(f"✔ replied: {p.url}")


# --- read ----------------------------------------------------------------
def cmd_whoami(args):
    me = _client(args).me()
    print(f"@{me['username']} — {me['name']}")
    print(f"  {me['description'] or ''}")
    print(f"  followers {me['followers']} · following {me['following']} · "
          f"tweets {me['tweets']} · since {me['created_at']}")


def cmd_profile(args):
    u = _client(args).resolve_user(args.handle)
    if args.json:
        print(json.dumps(u, indent=2, default=str))
        return
    print(f"@{u['username']} — {u['name']}"
          + ("  ✓" if u.get("verified") else ""))
    print(f"  {u['description'] or ''}")
    if u.get("url"):
        print(f"  link: {u['url']}")
    if u.get("location"):
        print(f"  loc:  {u['location']}")
    print(f"  followers {u['followers']} · following {u['following']} · "
          f"tweets {u['tweets']} · listed {u['listed']}")
    print(f"  joined {u['created_at']}")


def cmd_read(args):
    rows = _client(args).read_timeline(
        username=args.handle, limit=args.n,
        exclude_replies=args.no_replies, exclude_retweets=args.no_retweets)
    _emit(rows, args.json)


def cmd_tweet(args):
    _emit(_client(args).read_tweet(args.id), args.json)


def cmd_mentions(args):
    _emit(_client(args).mentions(limit=args.n), args.json)


def cmd_export(args):
    c = _client(args)
    out = args.out or (HERE / "export" / "profile.json")
    snap = c.export_profile(out, max_tweets=args.max)
    print(f"✔ exported @{snap['profile']['username']}: "
          f"{snap['tweet_count']} tweets + profile → {out}")


# --- manage --------------------------------------------------------------
def cmd_delete(args):
    ok = _client(args).delete(args.id)
    print(f"{'✔ deleted' if ok else '✗ not deleted'}: {args.id}")


def cmd_like(args):
    ok = _client(args).like(args.id, on=not args.off)
    print(f"{'✔' if ok else '✗'} {'unliked' if args.off else 'liked'} {args.id}")


def cmd_retweet(args):
    ok = _client(args).retweet(args.id, on=not args.off)
    print(f"{'✔' if ok else '✗'} {'unretweeted' if args.off else 'retweeted'} {args.id}")


def cmd_follow(args):
    ok = _client(args).follow(args.handle, on=not args.off)
    print(f"{'✔' if ok else '✗'} {'unfollowed' if args.off else 'followed'} @{args.handle.lstrip('@')}")


def cmd_set_profile(args):
    u = _client(args).update_profile(
        name=args.name, description=args.bio, url=args.url, location=args.location)
    print("✔ profile updated")
    if isinstance(u, dict) and u.get("username"):
        print(f"  @{u['username']} — {u.get('name')}\n  {u.get('description')}")


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="xcli", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--handle", help="account handle (default: X_HANDLE or spaceshipalpha9)")
    ap.add_argument("--dry-run", action="store_true",
                    help="print writes instead of sending; needs no credentials")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("post", help="post a tweet (auto-threads if >280 or --split)")
    p.add_argument("text")
    p.add_argument("--media", nargs="+")
    p.add_argument("--reply-to")
    p.add_argument("--quote")
    p.add_argument("--split", action="store_true", help="force thread-split")
    p.add_argument("--no-number", action="store_true", help="don't append (i/n)")
    p.set_defaults(func=cmd_post)

    p = sub.add_parser("thread", help="post a reply-chain thread")
    p.add_argument("parts", nargs="*", help="one tweet per argument")
    p.add_argument("--file", help="read text from a file and auto-split it")
    p.add_argument("--media", nargs="+", help="attach to the first tweet")
    p.add_argument("--number", action="store_true", help="append (i/n) to explicit parts")
    p.add_argument("--no-number", action="store_true", help="with --file, don't number")
    p.set_defaults(func=cmd_thread)

    p = sub.add_parser("reply", help="reply to a tweet")
    p.add_argument("id")
    p.add_argument("text")
    p.add_argument("--media", nargs="+")
    p.set_defaults(func=cmd_reply)

    sub.add_parser("whoami", help="show the authed account").set_defaults(func=cmd_whoami)

    p = sub.add_parser("profile", help="show a profile")
    p.add_argument("handle", nargs="?")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_profile)

    p = sub.add_parser("read", help="read a user's recent tweets")
    p.add_argument("handle", nargs="?")
    p.add_argument("-n", type=int, default=20)
    p.add_argument("--no-replies", action="store_true")
    p.add_argument("--no-retweets", action="store_true")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_read)

    p = sub.add_parser("tweet", help="read one tweet by id")
    p.add_argument("id")
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_tweet)

    p = sub.add_parser("mentions", help="read mentions of the authed account")
    p.add_argument("-n", type=int, default=20)
    p.add_argument("--json", action="store_true")
    p.set_defaults(func=cmd_mentions)

    p = sub.add_parser("export", help="back up the whole profile to JSON")
    p.add_argument("--out")
    p.add_argument("--max", type=int, default=3200, help="max tweets (API caps ~3200)")
    p.set_defaults(func=cmd_export)

    p = sub.add_parser("delete", help="delete a tweet")
    p.add_argument("id")
    p.set_defaults(func=cmd_delete)

    p = sub.add_parser("like", help="like (or --off unlike) a tweet")
    p.add_argument("id")
    p.add_argument("--off", action="store_true")
    p.set_defaults(func=cmd_like)

    p = sub.add_parser("retweet", help="retweet (or --off unretweet) a tweet")
    p.add_argument("id")
    p.add_argument("--off", action="store_true")
    p.set_defaults(func=cmd_retweet)

    p = sub.add_parser("follow", help="follow (or --off unfollow) a handle")
    p.add_argument("handle")
    p.add_argument("--off", action="store_true")
    p.set_defaults(func=cmd_follow)

    p = sub.add_parser("set-profile", help="edit bio fields")
    p.add_argument("--name")
    p.add_argument("--bio", help="the description / bio text")
    p.add_argument("--url")
    p.add_argument("--location")
    p.set_defaults(func=cmd_set_profile)

    return ap


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        args.func(args)
    except XError as e:
        sys.exit(f"error: {e}")


if __name__ == "__main__":
    main()
