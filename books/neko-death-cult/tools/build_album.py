#!/usr/bin/env python3
"""Assemble / validate the *Signal Finds Signal* album release.

Reads the manifest (`audio/album/ALBUM.md`), checks each locked master exists,
and writes an ordered M3U playlist. With --concat, renders a single continuous
full-album MP3 from the locked masters (in order).

    python3 tools/build_album.py            # validate + write playlist
    python3 tools/build_album.py --concat   # also render the full-album mp3

Exit status is non-zero if fewer than 24 masters are locked-and-present, so this
doubles as a release gate.
"""
import re, sys, subprocess, pathlib

BOOK = pathlib.Path(__file__).resolve().parent.parent
ALBUMDIR = BOOK / "audio" / "album"
MANIFEST = ALBUMDIR / "ALBUM.md"
PLAYLIST = ALBUMDIR / "signal-finds-signal.m3u"
FULL = ALBUMDIR / "signal-finds-signal_full-album.mp3"


def rows():
    """Parse the status table -> [(num, title, door, locked, master)]."""
    out = []
    for line in MANIFEST.read_text().splitlines():
        cells = [c.strip() for c in line.split("|")]
        if len(cells) >= 7 and cells[1].isdigit():
            num, title, door, status, master = cells[1], cells[2], cells[3], cells[4], cells[5]
            locked = "LOCKED" in status
            master = re.sub(r"`", "", master).strip() if master != "—" else ""
            out.append((num, title, door, locked, master))
    return out


def main():
    concat = "--concat" in sys.argv[1:]
    rs = rows()
    if not rs:
        sys.exit(f"no track rows parsed from {MANIFEST}")

    ready, missing, pending = [], [], []
    for num, title, door, locked, master in rs:
        if not locked or not master:
            pending.append((num, title))
            continue
        path = ALBUMDIR / master
        (ready if path.exists() else missing).append((num, title, path))

    print(f"parsed {len(rs)} tracks: {len(ready)} ready, "
          f"{len(missing)} locked-but-missing, {len(pending)} pending")
    for num, title in pending:
        print(f"  ⬜ {num} {title} — pending master")
    for num, title, path in missing:
        print(f"  ✗ {num} {title} — LOCKED but file missing: {path.name}")

    # Playlist over whatever is ready (ordered).
    lines = ["#EXTM3U", "#PLAYLIST:Signal Finds Signal"]
    for num, title, door, locked, master in rs:
        path = ALBUMDIR / master if master else None
        if locked and path and path.exists():
            lines.append(f"#EXTINF:-1,{int(num):02d}. {title}")
            lines.append(master)
    PLAYLIST.write_text("\n".join(lines) + "\n")
    print(f"-> wrote {PLAYLIST.relative_to(BOOK)} ({len(ready)} tracks)")

    if concat:
        if len(ready) != len(rs):
            sys.exit("refusing to --concat a partial album; lock all 24 masters first")
        listfile = ALBUMDIR / "_concat.txt"
        listfile.write_text("".join(
            f"file '{(ALBUMDIR / m).as_posix()}'\n"
            for _, _, _, _, m in rs))
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0",
                        "-i", str(listfile), "-c", "copy", str(FULL)], check=True)
        listfile.unlink(missing_ok=True)
        print(f"-> rendered {FULL.relative_to(BOOK)}")

    if len(ready) != len(rs):
        sys.exit(f"release NOT complete: {len(ready)}/{len(rs)} masters locked & present")
    print("release complete: 24/24 masters locked & present ✓")


if __name__ == "__main__":
    main()
