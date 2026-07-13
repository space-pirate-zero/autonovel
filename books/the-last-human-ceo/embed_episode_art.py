#!/usr/bin/env python3
"""
embed_episode_art.py — upscale each anime episode image to 1500² JPEG and embed it
into its episode mp3 as the ID3 cover (replacing the show cover), preserving the
existing text tags. epNN.png <-> ch_NN_PRODUCED.mp3, 1:1 by number.

Outputs: art/episodes/epNN.jpg (used by the feed too) + re-tagged produced mp3s.

Usage (from the book dir):  python3 embed_episode_art.py   [N [M]]
"""
import subprocess, sys, shutil
from pathlib import Path

BASE = Path(__file__).parent
ART = BASE / "art" / "episodes"
PROD = BASE / "audiobook" / "produced"


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)


def upscale(png, jpg, size=1500):
    ff("-i", str(png), "-vf", f"scale={size}:{size}:flags=lanczos", "-q:v", "3", str(jpg))


def embed(mp3, jpg):
    tmp = mp3.with_suffix(".arttmp.mp3")
    ff("-i", str(mp3), "-i", str(jpg),
       "-map", "0:a", "-map", "1:v", "-map_metadata", "0",
       "-c", "copy", "-id3v2_version", "3",
       "-metadata:s:v", "title=Episode cover", "-disposition:v", "attached_pic",
       str(tmp))
    shutil.move(str(tmp), str(mp3))


def main():
    args = [int(a) for a in sys.argv[1:] if a.isdigit()]
    lo = args[0] if args else 1
    hi = args[1] if len(args) > 1 else (args[0] if args else 29)
    done = 0
    for n in range(lo, hi + 1):
        png = ART / f"ep{n:02d}.png"
        mp3 = PROD / f"ch_{n:02d}_PRODUCED.mp3"
        if not png.exists():
            print(f"  ep{n:02d}: no image, skip"); continue
        if not mp3.exists():
            print(f"  ep{n:02d}: no mp3, skip"); continue
        jpg = ART / f"ep{n:02d}.jpg"
        upscale(png, jpg)
        embed(mp3, jpg)
        done += 1
        print(f"  ep{n:02d}: embedded {jpg.name} -> {mp3.name}")
    print(f"\nembedded {done} episode covers")


if __name__ == "__main__":
    main()
