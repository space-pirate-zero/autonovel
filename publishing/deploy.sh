#!/usr/bin/env bash
# Deploy the SPZ podcast: audio+cover -> public GCS, feed -> Cloud Run.
#
# WHAT THIS DOES (all in your 'stylelift' project, your billing):
#   1. create the GCS bucket if missing, make its objects public-read
#   2. build the square podcast cover, upload cover + all 29 episode mp3s
#   3. generate feed.xml and deploy a Cloud Run service that serves it
#   4. print the FEED URL to submit to Apple + Spotify
#
# It is idempotent — safe to re-run (re-uploads changed files, redeploys).
# Requires: gcloud (authed), a billing-enabled project, ffmpeg, python3.
set -euo pipefail
cd "$(dirname "$0")/.."                     # repo root
PUB=publishing
cfg(){ python3 -c "import json,sys;print(json.load(open('$PUB/config.json'))$1)"; }
PROJECT=$(cfg "['gcp']['project']"); REGION=$(cfg "['gcp']['region']")
BUCKET=$(cfg "['gcp']['bucket']"); PREFIX=$(cfg "['gcp']['prefix']")
SERVICE=$(cfg "['gcp']['service']"); PRODUCED=$(cfg "['source']['produced_dir']")
SITE_URL=$(cfg ".get('show',{}).get('public_url','')")   # custom domain, canonical for SEO
GCS="gs://$BUCKET/$PREFIX"
BASE="https://storage.googleapis.com/$BUCKET/$PREFIX"

echo "project=$PROJECT region=$REGION bucket=$BUCKET service=$SERVICE"
gcloud config set project "$PROJECT" >/dev/null
echo "enabling required services (run, cloudbuild, storage)…"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com storage.googleapis.com >/dev/null

# 1) bucket + public read
if ! gcloud storage buckets describe "gs://$BUCKET" >/dev/null 2>&1; then
  echo "creating gs://$BUCKET …"
  gcloud storage buckets create "gs://$BUCKET" --location="$REGION" --uniform-bucket-level-access
fi
echo "granting public object read (allUsers:objectViewer)…"
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member=allUsers --role=roles/storage.objectViewer >/dev/null || {
    echo "!! could not make bucket public — an org policy may block public buckets."
    echo "   Fix that (or use a signed-URL/CDN variant) and re-run."; exit 1; }

# 2) cover + audio upload
python3 "$PUB/make_cover.py"
echo "uploading cover + episodes to $GCS …"
gcloud storage cp "$PUB/build/cover.jpg" "$GCS/cover.jpg" \
  --cache-control="public,max-age=86400" >/dev/null
gcloud storage cp "$PRODUCED"/ch_*_PRODUCED.mp3 "$GCS/" \
  --cache-control="public,max-age=86400" >/dev/null
# per-episode artwork (if generated)
ART=$(cfg "['source']['episode_art_dir']")
if ls "$ART"/ep*.jpg >/dev/null 2>&1; then
  echo "uploading per-episode artwork…"
  gcloud storage cp "$ART"/ep*.jpg "$GCS/art/" --cache-control="public,max-age=86400" >/dev/null
fi
# social video: trailer + audiograms + per-chapter teasers (for the site hero + chapter audiograms)
VID="books/the-last-human-ceo/social/video"
if ls "$VID"/*.mp4 >/dev/null 2>&1; then
  echo "uploading trailer + audiograms + teasers…"
  gcloud storage cp "$VID"/trailer.mp4 "$VID"/audiogram_*.mp4 "$GCS/video/" --cache-control="public,max-age=86400" >/dev/null 2>&1 || true
  ls "$VID"/teasers/teaser_ep*.mp4 >/dev/null 2>&1 && gcloud storage cp "$VID"/teasers/teaser_ep*.mp4 "$GCS/video/" --cache-control="public,max-age=86400" >/dev/null 2>&1 || true
fi
echo "  audio + cover + video public at $BASE/"

# 3) first feed + site (self-url guessed) + deploy to learn the service URL
python3 "$PUB/gen_feed.py" --base "$BASE" >/dev/null
python3 "$PUB/gen_site.py" >/dev/null
echo "deploying Cloud Run service (pass 1)…"
gcloud run deploy "$SERVICE" --source "$PUB/app" --region "$REGION" \
  --allow-unauthenticated --port 8080 --memory 256Mi --cpu 1 --min-instances 1 --max-instances 3 --quiet
URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')

# 4) rebuild feed + site with the real canonical URL, redeploy
#    Feed self-url stays on the service URL (what Apple/Spotify ingested);
#    the marketing site canonicalises to the custom domain for SEO.
CANON="${SITE_URL:-$URL}"
python3 "$PUB/gen_feed.py" --base "$BASE" --self-url "$URL/feed.xml" >/dev/null
python3 "$PUB/gen_site.py" --site-url "$CANON" >/dev/null
echo "redeploying with canonical URL (pass 2)…"
gcloud run deploy "$SERVICE" --source "$PUB/app" --region "$REGION" \
  --allow-unauthenticated --port 8080 --memory 256Mi --cpu 1 --min-instances 1 --max-instances 3 --quiet

echo ""
echo "=================== DEPLOYED ==================="
echo "Landing page : $URL"
echo "FEED URL     : $URL/feed.xml"
echo "  ^ submit THIS URL once to Apple Podcasts Connect and Spotify for Podcasters."
echo "  (see publishing/README.md for the submit steps)"
