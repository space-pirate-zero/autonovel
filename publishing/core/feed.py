"""Build a podcast RSS feed (iTunes + podcast namespaces) from a manifest.

Apple Podcasts and Spotify both ingest this feed; the iTunes tags below are the
ones they actually require (title, author, owner, image, category, explicit,
type, and per-episode enclosure/duration/episode/season). Output is bytes ready
to upload as feed.xml.
"""
from __future__ import annotations

from datetime import datetime

from feedgen.feed import FeedGenerator

from . import manifest as mani


def _explicit(fx, value: bool) -> None:
    """feedgen changed itunes_explicit's accepted type across versions."""
    for candidate in (value, "yes" if value else "no", "true" if value else "false"):
        try:
            fx.itunes_explicit(candidate)
            return
        except (ValueError, TypeError):
            continue


def build_feed(show: dict, manifest: dict) -> bytes:
    fg = FeedGenerator()
    fg.load_extension("podcast")

    fg.title(show["title"])
    fg.link(href=show["feed_url"], rel="self")
    if show.get("site_url"):
        fg.link(href=show["site_url"], rel="alternate")
    fg.description(show["description"])
    if show.get("subtitle"):
        fg.podcast.itunes_subtitle(show["subtitle"])
    fg.language(show.get("language", "en"))
    fg.author({"name": show["author"], "email": show["owner_email"]})
    fg.logo(show["cover_url"])

    fg.podcast.itunes_author(show["author"])
    fg.podcast.itunes_owner(show["owner_name"], show["owner_email"])
    fg.podcast.itunes_image(show["cover_url"])
    fg.podcast.itunes_summary(show["description"])
    fg.podcast.itunes_category(show["category"], show.get("subcategory"))
    fg.podcast.itunes_type(show.get("type", "episodic"))
    _explicit(fg.podcast, bool(show.get("explicit", False)))

    # feedgen prepends entries, so add in ascending order to get newest-last-added.
    for ep in mani.episodes_sorted(manifest):
        fe = fg.add_entry()
        fe.id(ep["guid"])
        fe.guid(ep["guid"], permalink=False)
        fe.title(ep["title"])
        fe.description(ep["description"])
        fe.enclosure(ep["audio_url"], str(ep["size"]), "audio/mpeg")
        fe.pubDate(datetime.fromisoformat(ep["pubdate"]))
        fe.podcast.itunes_duration(ep["duration"])
        fe.podcast.itunes_episode(ep["n"])
        if ep.get("season"):
            fe.podcast.itunes_season(ep["season"])
        _explicit(fe.podcast, bool(show.get("explicit", False)))
        fe.podcast.itunes_image(show["cover_url"])

    return fg.rss_str(pretty=True)
