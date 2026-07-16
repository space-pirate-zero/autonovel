#!/usr/bin/env python3
"""
XClient — publish, read, and manage the @spaceshipalpha9 X (Twitter) profile.

Thin wrapper over Tweepy that speaks the X API v2 (create/read/delete tweets,
likes, retweets, follows, mentions, user timeline) plus the v1.1 endpoints that
v2 never got (media upload, profile edit). One class, honest surface — every
method maps to a real X endpoint; nothing is faked.

AUTH — set these in the gitignored repo-root .env (see .env.example, and
x/README.md for how to mint them at developer.x.com). All four OAuth 1.0a
user-context keys are required to POST or manage; the bearer token is optional
and only used for app-only reads.

    X_API_KEY=...              # consumer key
    X_API_SECRET=...           # consumer secret
    X_ACCESS_TOKEN=...         # user access token (@spaceshipalpha9)
    X_ACCESS_TOKEN_SECRET=...  # user access token secret
    X_BEARER_TOKEN=...         # optional, OAuth2 app-only (read)
    X_HANDLE=spaceshipalpha9   # optional, default account handle

Connections are lazy: constructing an XClient touches no network, and any call
made with dry_run=True prints the payload instead of hitting a write endpoint —
so the CLI's --dry-run and thread-splitting can be exercised without credentials.

Tweepy is a project dependency (pyproject.toml), so run through uv:

    uv run python x/xcli.py whoami
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")  # pull X_* out of the gitignored .env
except Exception:
    pass

# X counts every t.co-wrapped link as this many characters, regardless of length.
TCO_LEN = 23
TWEET_LIMIT = 280
_URL_RE = re.compile(r"https?://\S+")


class XError(RuntimeError):
    """Raised for auth / configuration problems before any network call."""


def _import_tweepy():
    try:
        import tweepy
        return tweepy
    except ImportError as e:
        raise XError(
            "Tweepy is not installed. It's a project dependency — run commands "
            "through uv (`uv run python x/xcli.py ...`), or `uv sync` / "
            "`pip install tweepy`."
        ) from e


def weighted_len(text: str) -> int:
    """Approximate X's weighted character count.

    URLs collapse to 23 chars (t.co). CJK / wide characters weigh 2, everything
    else weighs 1. This is close enough to gate composition; the API is the final
    authority and will 403 an over-long tweet if we're wrong at the margin.
    """
    stripped = _URL_RE.sub("", text)
    url_cost = len(_URL_RE.findall(text)) * TCO_LEN
    body = 0
    for ch in stripped:
        o = ord(ch)
        # CJK, Hiragana/Katakana, Hangul, fullwidth forms weigh 2 per X's rules.
        wide = (0x1100 <= o <= 0x115F or 0x2E80 <= o <= 0x303E or
                0x3041 <= o <= 0x33FF or 0x3400 <= o <= 0x4DBF or
                0x4E00 <= o <= 0x9FFF or 0xA000 <= o <= 0xA4CF or
                0xAC00 <= o <= 0xD7A3 or 0xF900 <= o <= 0xFAFF or
                0xFE30 <= o <= 0xFE4F or 0xFF00 <= o <= 0xFF60 or
                0xFFE0 <= o <= 0xFFE6)
        body += 2 if wide else 1
    return body + url_cost


def split_thread(text: str, limit: int = TWEET_LIMIT, number: bool = True) -> list[str]:
    """Split long text into a thread of <=limit weighted-char tweets.

    Breaks on blank lines first, then sentences, then words. Never splits a word.
    With number=True, appends " (i/n)" and re-checks the budget so the counter
    never pushes a tweet over the limit.
    """
    text = text.strip()
    if not text:
        return []
    if weighted_len(text) <= limit and "\n\n" not in text:
        return [text]

    # Reserve room for a " (10/10)" style suffix when numbering.
    suffix_budget = 8 if number else 0
    budget = limit - suffix_budget

    # Candidate atoms: paragraphs -> sentences -> words.
    atoms: list[str] = []
    for para in re.split(r"\n\s*\n", text):
        para = para.strip()
        if not para:
            continue
        if weighted_len(para) <= budget:
            atoms.append(para)
            continue
        for sent in re.split(r"(?<=[.!?…])\s+", para):
            sent = sent.strip()
            if not sent:
                continue
            if weighted_len(sent) <= budget:
                atoms.append(sent)
            else:
                atoms.extend(_hard_wrap_words(sent, budget))

    # Greedily pack atoms into tweets.
    tweets: list[str] = []
    cur = ""
    for atom in atoms:
        candidate = atom if not cur else f"{cur}\n\n{atom}"
        if weighted_len(candidate) <= budget:
            cur = candidate
        else:
            if cur:
                tweets.append(cur)
            cur = atom
    if cur:
        tweets.append(cur)

    if number and len(tweets) > 1:
        n = len(tweets)
        tweets = [f"{t} ({i}/{n})" for i, t in enumerate(tweets, 1)]
    return tweets


def _hard_wrap_words(text: str, budget: int) -> list[str]:
    out, cur = [], ""
    for word in text.split():
        candidate = word if not cur else f"{cur} {word}"
        if weighted_len(candidate) <= budget:
            cur = candidate
        else:
            if cur:
                out.append(cur)
            cur = word
    if cur:
        out.append(cur)
    return out


@dataclass
class Posted:
    id: str
    text: str
    url: str


class XClient:
    """Lazy Tweepy wrapper for one X account (default @spaceshipalpha9)."""

    def __init__(self, dry_run: bool = False, handle: str | None = None):
        self.dry_run = dry_run
        self.handle = (handle or os.environ.get("X_HANDLE", "spaceshipalpha9")).lstrip("@")
        self._v2 = None       # tweepy.Client (v2)
        self._v1 = None       # tweepy.API (v1.1, for media + profile edit)
        self._me = None       # cached get_me() id/username

    # --- connection (built on first use) ---------------------------------
    def _require(self, *names: str) -> dict[str, str]:
        vals = {n: os.environ.get(n) for n in names}
        missing = [n for n, v in vals.items() if not v]
        if missing:
            raise XError(
                "Missing X credentials: " + ", ".join(missing) +
                ".\nSet them in the repo-root .env (see .env.example) — mint keys "
                "at https://developer.x.com → Projects & Apps → Keys and tokens."
            )
        return vals

    @property
    def v2(self):
        if self._v2 is None:
            tweepy = _import_tweepy()
            c = self._require("X_API_KEY", "X_API_SECRET",
                              "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET")
            self._v2 = tweepy.Client(
                bearer_token=os.environ.get("X_BEARER_TOKEN"),
                consumer_key=c["X_API_KEY"],
                consumer_secret=c["X_API_SECRET"],
                access_token=c["X_ACCESS_TOKEN"],
                access_token_secret=c["X_ACCESS_TOKEN_SECRET"],
                wait_on_rate_limit=True,
            )
        return self._v2

    @property
    def v1(self):
        if self._v1 is None:
            tweepy = _import_tweepy()
            c = self._require("X_API_KEY", "X_API_SECRET",
                              "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET")
            auth = tweepy.OAuth1UserHandler(
                c["X_API_KEY"], c["X_API_SECRET"],
                c["X_ACCESS_TOKEN"], c["X_ACCESS_TOKEN_SECRET"],
            )
            self._v1 = tweepy.API(auth, wait_on_rate_limit=True)
        return self._v1

    # --- identity --------------------------------------------------------
    def me(self) -> dict[str, Any]:
        if self._me is None:
            r = self.v2.get_me(user_fields=[
                "created_at", "description", "public_metrics", "url",
                "location", "verified", "profile_image_url", "pinned_tweet_id",
            ])
            self._me = _user_dict(r.data)
        return self._me

    def resolve_user(self, username: str | None) -> dict[str, Any]:
        """Return {id, username, ...} for a handle, or the authed account if None."""
        if username is None or username.lstrip("@").lower() == self.handle.lower():
            return self.me()
        r = self.v2.get_user(username=username.lstrip("@"), user_fields=[
            "created_at", "description", "public_metrics", "url",
            "location", "verified", "pinned_tweet_id",
        ])
        if not r.data:
            raise XError(f"No such user: @{username}")
        return _user_dict(r.data)

    # --- publish ---------------------------------------------------------
    def upload_media(self, paths: Iterable[str]) -> list[str]:
        ids = []
        for p in paths:
            path = Path(p)
            if not path.exists():
                raise XError(f"Media not found: {path}")
            if self.dry_run:
                print(f"    [dry-run] would upload media: {path}")
                ids.append(f"dryrun-media-{path.name}")
                continue
            m = self.v1.media_upload(filename=str(path))
            ids.append(m.media_id_string)
        return ids

    def post(self, text: str, media: list[str] | None = None,
             reply_to: str | None = None, quote: str | None = None) -> Posted:
        text = text.rstrip()
        if weighted_len(text) > TWEET_LIMIT:
            raise XError(
                f"Tweet is {weighted_len(text)} weighted chars (> {TWEET_LIMIT}). "
                "Use a thread (xcli.py thread) or --split."
            )
        media_ids = self.upload_media(media) if media else None
        if self.dry_run:
            tag = f" ↩reply→{reply_to}" if reply_to else ""
            tag += f" ⟳quote→{quote}" if quote else ""
            tag += f" 📎{media_ids}" if media_ids else ""
            print(f"    [dry-run] would post ({weighted_len(text)} chars){tag}:\n"
                  f"    {text!r}")
            return Posted(id="dryrun", text=text, url="(dry-run)")
        r = self.v2.create_tweet(
            text=text, media_ids=media_ids,
            in_reply_to_tweet_id=reply_to, quote_tweet_id=quote,
        )
        tid = str(r.data["id"])
        return Posted(id=tid, text=text,
                      url=f"https://x.com/{self.handle}/status/{tid}")

    def reply(self, tweet_id: str, text: str, media: list[str] | None = None) -> Posted:
        return self.post(text, media=media, reply_to=tweet_id)

    def thread(self, parts: list[str], media_first: list[str] | None = None,
               pause: float = 1.0) -> list[Posted]:
        """Post parts as a reply-chain. media_first attaches to tweet 1 only."""
        posted: list[Posted] = []
        prev: str | None = None
        for i, part in enumerate(parts):
            media = media_first if i == 0 else None
            p = self.post(part, media=media, reply_to=prev)
            posted.append(p)
            prev = p.id
            if not self.dry_run and i != len(parts) - 1:
                time.sleep(pause)
        return posted

    # --- read ------------------------------------------------------------
    def read_timeline(self, username: str | None = None, limit: int = 20,
                      exclude_replies: bool = False,
                      exclude_retweets: bool = False) -> list[dict[str, Any]]:
        tweepy = _import_tweepy()
        user = self.resolve_user(username)
        excludes = []
        if exclude_replies:
            excludes.append("replies")
        if exclude_retweets:
            excludes.append("retweets")
        out: list[dict[str, Any]] = []
        paginator = tweepy.Paginator(
            self.v2.get_users_tweets, id=user["id"],
            exclude=excludes or None,
            tweet_fields=["created_at", "public_metrics", "conversation_id",
                          "in_reply_to_user_id", "referenced_tweets"],
            max_results=min(100, max(5, limit)),
        )
        for t in paginator.flatten(limit=limit):
            out.append(_tweet_dict(t, user["username"]))
        return out

    def read_tweet(self, tweet_id: str) -> dict[str, Any]:
        r = self.v2.get_tweet(tweet_id, tweet_fields=[
            "created_at", "public_metrics", "conversation_id",
            "author_id", "referenced_tweets",
        ], expansions=["author_id"])
        if not r.data:
            raise XError(f"No such tweet: {tweet_id}")
        author = None
        if r.includes and r.includes.get("users"):
            author = r.includes["users"][0].username
        return _tweet_dict(r.data, author or self.handle)

    def mentions(self, limit: int = 20) -> list[dict[str, Any]]:
        tweepy = _import_tweepy()
        me = self.me()
        out: list[dict[str, Any]] = []
        for t in tweepy.Paginator(
            self.v2.get_users_mentions, id=me["id"],
            tweet_fields=["created_at", "public_metrics", "author_id"],
            max_results=min(100, max(5, limit)),
        ).flatten(limit=limit):
            out.append(_tweet_dict(t, None))
        return out

    def export_profile(self, out_path: str | Path, max_tweets: int = 3200) -> dict[str, Any]:
        """Snapshot the profile + up to max_tweets of its timeline to JSON.

        The read side of "manage your entire profile": a local, portable backup
        of who the account is and everything it has said (X API caps user-timeline
        reads at ~3,200 tweets deep).
        """
        me = self.me()
        tweets = self.read_timeline(username=me["username"], limit=max_tweets)
        snapshot = {"profile": me, "tweet_count": len(tweets), "tweets": tweets}
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(snapshot, indent=2, default=str))
        return snapshot

    # --- manage ----------------------------------------------------------
    def delete(self, tweet_id: str) -> bool:
        if self.dry_run:
            print(f"    [dry-run] would delete tweet {tweet_id}")
            return True
        r = self.v2.delete_tweet(tweet_id)
        return bool(r.data.get("deleted"))

    def like(self, tweet_id: str, on: bool = True) -> bool:
        if self.dry_run:
            print(f"    [dry-run] would {'like' if on else 'unlike'} {tweet_id}")
            return True
        r = self.v2.like(tweet_id) if on else self.v2.unlike(tweet_id)
        return bool(r.data.get("liked", not on) if on else not r.data.get("liked", False))

    def retweet(self, tweet_id: str, on: bool = True) -> bool:
        if self.dry_run:
            print(f"    [dry-run] would {'retweet' if on else 'unretweet'} {tweet_id}")
            return True
        r = self.v2.retweet(tweet_id) if on else self.v2.unretweet(tweet_id)
        return bool(r.data.get("retweeted", not on) if on else not r.data.get("retweeted", False))

    def follow(self, username: str, on: bool = True) -> bool:
        target = self.resolve_user(username)
        if self.dry_run:
            print(f"    [dry-run] would {'follow' if on else 'unfollow'} @{target['username']}")
            return True
        r = (self.v2.follow_user(target["id"]) if on
             else self.v2.unfollow_user(target["id"]))
        return bool(r.data.get("following", not on) if on else not r.data.get("following", False))

    def update_profile(self, name: str | None = None, description: str | None = None,
                       url: str | None = None, location: str | None = None) -> dict[str, Any]:
        """Edit account bio fields via v1.1 (v2 has no profile-write endpoint)."""
        fields = {k: v for k, v in dict(
            name=name, description=description, url=url, location=location
        ).items() if v is not None}
        if not fields:
            raise XError("Nothing to update — pass at least one of name/description/url/location.")
        if self.dry_run:
            print(f"    [dry-run] would update profile: {fields}")
            return fields
        self.v1.update_profile(**fields)
        self._me = None  # bust cache
        return self.me()


# --- serialization helpers ----------------------------------------------
def _user_dict(u) -> dict[str, Any]:
    m = getattr(u, "public_metrics", None) or {}
    return {
        "id": str(u.id),
        "username": u.username,
        "name": u.name,
        "description": getattr(u, "description", None),
        "url": getattr(u, "url", None),
        "location": getattr(u, "location", None),
        "verified": getattr(u, "verified", None),
        "created_at": getattr(u, "created_at", None),
        "pinned_tweet_id": str(getattr(u, "pinned_tweet_id", "") or "") or None,
        "followers": m.get("followers_count"),
        "following": m.get("following_count"),
        "tweets": m.get("tweet_count"),
        "listed": m.get("listed_count"),
    }


def _tweet_dict(t, author: str | None) -> dict[str, Any]:
    m = getattr(t, "public_metrics", None) or {}
    tid = str(t.id)
    return {
        "id": tid,
        "author": author,
        "created_at": getattr(t, "created_at", None),
        "text": t.text,
        "likes": m.get("like_count"),
        "retweets": m.get("retweet_count"),
        "replies": m.get("reply_count"),
        "quotes": m.get("quote_count"),
        "url": f"https://x.com/{author}/status/{tid}" if author else f"https://x.com/i/status/{tid}",
    }


if __name__ == "__main__":
    # Smoke test the offline-safe pieces (no network, no credentials needed).
    demo = ("Space Pirate Zero, transmitting. " * 30).strip()
    parts = split_thread(demo)
    print(f"weighted_len('hello') = {weighted_len('hello')}")
    print(f"split_thread -> {len(parts)} tweets; "
          f"max weighted len = {max(weighted_len(p) for p in parts)}")
    for i, p in enumerate(parts, 1):
        print(f"  [{i}] {p}")
    sys.exit(0)
