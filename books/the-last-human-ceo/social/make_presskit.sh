#!/usr/bin/env bash
# Build the downloadable press kit (press-kit.zip) and upload it to public GCS.
# Bundles: cover + key art, fact sheet + copy pack, all social graphics
# (launch + 29 episode cards square & 9:16 + quote cards), and every video
# (trailer, both audiograms, all 29 per-episode teasers).
#
# Run:  bash social/make_presskit.sh
set -euo pipefail
cd "$(dirname "$0")/.."                                   # books/the-last-human-ceo
BOOK=$(pwd)
GCS="gs://spz-podcasts/the-last-human-ceo/press-kit.zip"
STAGE=$(mktemp -d)/press-kit
mkdir -p "$STAGE"/{art,images,video/teasers,copy}

# fact sheet + copy
cp social/PRESS.md "$STAGE/copy/FACT-SHEET.md"
cp social/COPY.md  "$STAGE/copy/COPY.md"
cp social/README.md "$STAGE/README.md"

# cover + key art
cp art/podcast_cover_src.png "$STAGE/art/cover.png"
[ -f art/cover_front_master.png ] && cp art/cover_front_master.png "$STAGE/art/key-art.png"

# social graphics (launch + episode cards + quote cards)
cp social/img/*.jpg "$STAGE/images/" 2>/dev/null || true

# video: trailer + audiograms + teasers
cp social/video/*.mp4 "$STAGE/video/" 2>/dev/null || true
cp social/video/teasers/*.mp4 "$STAGE/video/teasers/" 2>/dev/null || true

# zip (store, not recompress — jpg/mp4 already compressed)
OUT="$BOOK/social/press-kit.zip"
( cd "$(dirname "$STAGE")" && zip -r -q -0 "$OUT" "press-kit" )
SZ=$(du -h "$OUT" | cut -f1)
echo "built $OUT ($SZ) — $(cd "$STAGE" && find . -type f | wc -l | tr -d ' ') files"

gcloud storage cp "$OUT" "$GCS" --cache-control="public,max-age=3600" >/dev/null
echo "uploaded -> $GCS"
rm -rf "$(dirname "$STAGE")"
