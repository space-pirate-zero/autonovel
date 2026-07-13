#!/usr/bin/env python3
"""
make_cover.py — build a 3000x3000 SQUARE podcast cover from the portrait book
cover (Apple/Spotify require a square 1400-3000px RGB image). Classic treatment:
the portrait art centered over a blurred, darkened fill of itself.

Output: publishing/build/cover.jpg  (uploaded to GCS as <prefix>/cover.jpg)

Usage (from repo root):  python publishing/make_cover.py
"""
import json, subprocess, sys
from pathlib import Path

PUB = Path(__file__).resolve().parent
ROOT = PUB.parent
CFG = json.loads((PUB / "config.json").read_text())
SRC = ROOT / CFG["source"]["cover_master"]
OUT = PUB / "build" / "cover.jpg"
SIZE = 3000


def main():
    if not SRC.exists():
        sys.exit(f"cover master not found: {SRC}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fc = (
        f"[0:v]scale={SIZE}:{SIZE}:force_original_aspect_ratio=increase,"
        f"crop={SIZE}:{SIZE},boxblur=40:2,eq=brightness=-0.18:saturation=0.9[bg];"
        f"[0:v]scale=-1:{SIZE}[fg];"
        f"[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p"
    )
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(SRC),
                    "-filter_complex", fc, "-frames:v", "1", "-q:v", "3", str(OUT)],
                   check=True)
    dim = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                          "-show_entries", "stream=width,height", "-of", "csv=p=0", str(OUT)],
                         capture_output=True, text=True).stdout.strip()
    print(f"cover: {OUT}  ({dim}, {OUT.stat().st_size//1024} KB)")


if __name__ == "__main__":
    main()
