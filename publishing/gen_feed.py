#!/usr/bin/env python3
"""
gen_feed.py — build a spec-compliant podcast RSS 2.0 feed (Apple + Spotify tags)
for the produced audiobook chapters, referencing their public GCS URLs.

Reads publishing/config.json + the produced mp3s (for duration + byte size) +
the per-chapter intro texts (episode show notes). Writes publishing/app/feed.xml
so the Cloud Run container can serve it at /feed.xml.

Usage (from repo root):
  python publishing/gen_feed.py
  python publishing/gen_feed.py --base https://storage.googleapis.com/spz-podcasts/the-last-human-ceo
The --base override is handy for local testing; normally the base is derived from
config gcp.bucket + prefix.
"""
import json, os, re, sys, subprocess, argparse
from pathlib import Path
from datetime import datetime, timedelta, timezone
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent          # repo root
PUB = Path(__file__).resolve().parent                   # publishing/
CFG = json.loads((PUB / "config.json").read_text())


def public_base(cfg):
    g = cfg["gcp"]
    return f"https://storage.googleapis.com/{g['bucket']}/{g['prefix']}"


def probe_dur(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    try:
        return int(float(r.stdout.strip()))
    except Exception:
        return 0


def hms(secs):
    h, rem = divmod(secs, 3600)
    m, s = divmod(rem, 60)
    return f"{h:d}:{m:02d}:{s:02d}" if h else f"{m:d}:{s:02d}"


def rfc2822(dt):
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0000")


def chapter_title(n, cfg):
    cd = ROOT / cfg["source"]["chapters_dir"]
    p = (cd / "ch_coda.md") if n == 29 else (cd / f"ch_{n:02d}.md")
    if p.exists():
        return p.read_text().splitlines()[0].lstrip("# ").strip()
    return f"Chapter {n}"


def episode_notes(n, cfg, title):
    """Show notes = the SPZ host-intro for that chapter (ch1 uses the show logline)."""
    intro = ROOT / cfg["source"]["intros_dir"] / f"ch{n:02d}.txt"
    if intro.exists():
        return intro.read_text().strip()
    return cfg["show"]["description"].split(". A full-cast")[0] + "."


def build_items(cfg, base):
    produced = ROOT / cfg["source"]["produced_dir"]
    files = sorted(produced.glob("ch_*_PRODUCED.mp3"),
                   key=lambda p: int(re.search(r'ch_(\d+)_', p.name).group(1)))
    if not files:
        sys.exit(f"no produced files in {produced}")

    # all-at-launch: back-date so ep1 is oldest and every ep is already in the past
    n_eps = len(files)
    hh, mm = map(int, cfg["schedule"]["start_time_utc"].split(":"))
    now = datetime.now(timezone.utc)
    space = timedelta(hours=cfg["schedule"]["spacing_hours"])
    # ep1 pubDate = now - n_eps*spacing ; ascending; all < now
    base_dt = (now - (n_eps + 1) * space).replace(hour=hh, minute=mm, second=0, microsecond=0)

    art_dir = ROOT / cfg["source"].get("episode_art_dir", "")
    items = []
    for i, f in enumerate(files, start=1):
        n = int(re.search(r'ch_(\d+)_', f.name).group(1))
        title = chapter_title(n, cfg)
        dur = probe_dur(f)
        size = f.stat().st_size
        url = f"{base}/{f.name}"
        pub = base_dt + i * space
        notes = episode_notes(n, cfg, title)
        # per-episode artwork (ep{episode}.jpg) if present locally -> use its GCS URL
        art = f"{base}/art/ep{i:02d}.jpg" if (art_dir / f"ep{i:02d}.jpg").exists() else f"{base}/cover.jpg"
        items.append({
            "ep": i, "n": n, "title": title, "url": url, "size": size,
            "dur": dur, "pub": pub, "notes": notes, "art": art,
            "guid": f"lhceo-ep{i:02d}",
        })
    return items


def render(cfg, base, items, self_url):
    s = cfg["show"]
    cover = f"{base}/cover.jpg"
    expl = "true" if s["explicit"] else "false"
    A = escape
    ns = ('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" '
          'xmlns:content="http://purl.org/rss/1.0/modules/content/" '
          'xmlns:podcast="https://podcastindex.org/namespace/1.0" '
          'xmlns:atom="http://www.w3.org/2005/Atom"')
    out = []
    out.append('<?xml version="1.0" encoding="UTF-8"?>')
    out.append(f'<rss version="2.0" {ns}>')
    out.append('<channel>')
    out.append(f'<title>{A(s["title"])}</title>')
    out.append(f'<link>{A(s["link"])}</link>')
    out.append(f'<language>{A(s["language"])}</language>')
    out.append(f'<copyright>{A(s["copyright"])}</copyright>')
    out.append(f'<description>{A(s["description"])}</description>')
    out.append(f'<itunes:subtitle>{A(s["subtitle"])}</itunes:subtitle>')
    out.append(f'<itunes:author>{A(s["author"])}</itunes:author>')
    out.append(f'<itunes:summary>{A(s["description"])}</itunes:summary>')
    out.append('<itunes:owner>'
               f'<itunes:name>{A(s["owner_name"])}</itunes:name>'
               f'<itunes:email>{A(s["owner_email"])}</itunes:email>'
               '</itunes:owner>')
    out.append(f'<itunes:image href="{A(cover)}"/>')
    out.append(f'<image><url>{A(cover)}</url><title>{A(s["title"])}</title>'
               f'<link>{A(s["link"])}</link></image>')
    out.append(f'<itunes:category text="{A(s["category"])}"/>')
    out.append(f'<itunes:explicit>{expl}</itunes:explicit>')
    out.append(f'<itunes:type>{A(s["type"])}</itunes:type>')
    out.append('<itunes:block>no</itunes:block>')
    out.append(f'<atom:link href="{A(self_url)}" rel="self" type="application/rss+xml"/>')
    if items:
        out.append(f'<lastBuildDate>{rfc2822(max(i["pub"] for i in items))}</lastBuildDate>')
    for it in items:
        out.append('<item>')
        out.append(f'<title>{A(it["title"])}</title>')
        out.append(f'<itunes:title>{A(it["title"])}</itunes:title>')
        out.append(f'<itunes:episode>{it["ep"]}</itunes:episode>')
        out.append('<itunes:season>1</itunes:season>')
        out.append('<itunes:episodeType>full</itunes:episodeType>')
        out.append(f'<guid isPermaLink="false">{A(it["guid"])}</guid>')
        out.append(f'<pubDate>{rfc2822(it["pub"])}</pubDate>')
        out.append(f'<description>{A(it["notes"])}</description>')
        out.append(f'<itunes:summary>{A(it["notes"])}</itunes:summary>')
        out.append(f'<content:encoded><![CDATA[<p>{it["notes"]}</p>]]></content:encoded>')
        out.append(f'<enclosure url="{A(it["url"])}" length="{it["size"]}" type="audio/mpeg"/>')
        out.append(f'<itunes:duration>{hms(it["dur"])}</itunes:duration>')
        out.append(f'<itunes:image href="{A(it.get("art", cover))}"/>')
        out.append(f'<itunes:explicit>{expl}</itunes:explicit>')
        out.append('</item>')
    out.append('</channel>')
    out.append('</rss>')
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", help="override public base URL for audio/cover (GCS)")
    ap.add_argument("--self-url", help="canonical URL where this feed is served (Cloud Run /feed.xml)")
    ap.add_argument("--out", default=str(PUB / "app" / "feed.xml"))
    args = ap.parse_args()
    base = args.base or public_base(CFG)
    self_url = args.self_url or f"{base}/feed.xml"
    items = build_items(CFG, base)
    xml = render(CFG, base, items, self_url)
    Path(args.out).write_text(xml)
    total = sum(i["dur"] for i in items)
    print(f"feed.xml written: {len(items)} episodes, {total/3600:.2f} h total")
    print(f"  base URL: {base}")
    print(f"  -> {args.out}")


if __name__ == "__main__":
    main()
