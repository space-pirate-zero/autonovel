#!/usr/bin/env bash
# deploy.sh — stand up the SPZ Asset MCP on Cloud Run (project from config.json).
#
# WHAT THIS DOES (all in your GCP project, your billing):
#   1. enable required services (run, cloudbuild, storage, firestore, aiplatform)
#   2. create the canonical asset bucket (public-read) if missing
#   3. create the Firestore DB + vector indexes (create_index.sh)
#   4. create the bearer-token secret if missing
#   5. grant the Cloud Run runtime SA the roles it needs
#   6. deploy the MCP container (scales to zero)
#   7. print the MCP endpoint + the client config to paste
#
# Idempotent — safe to re-run. Requires: gcloud (authed), python3, a billing-
# enabled project. Mirrors publishing/deploy.sh conventions.
set -euo pipefail
cd "$(dirname "$0")"
cfg(){ python3 -c "import json;print(json.load(open('config.json'))$1)"; }
PROJECT=$(cfg "['gcp']['project']");  REGION=$(cfg "['gcp']['region']")
BUCKET=$(cfg "['gcp']['bucket']");    DB=$(cfg "['gcp']['firestore_db']")
COLL=$(cfg "['gcp']['collection']");  SERVICE=$(cfg "['gcp']['service']")
SECRET="SPZ_ASSET_MCP_TOKEN"

echo "project=$PROJECT region=$REGION bucket=$BUCKET db=$DB service=$SERVICE"
gcloud config set project "$PROJECT" >/dev/null

echo "1) enabling services…"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  storage.googleapis.com firestore.googleapis.com aiplatform.googleapis.com \
  secretmanager.googleapis.com >/dev/null

echo "2) asset bucket…"
if ! gcloud storage buckets describe "gs://$BUCKET" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://$BUCKET" --location="$REGION" --uniform-bucket-level-access
fi
if [ "$(cfg ".get('public_read', True)")" = "True" ]; then
  gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
    --member=allUsers --role=roles/storage.objectViewer >/dev/null 2>&1 || \
    echo "   (could not make bucket public — an org policy may block it; assets still index)"
fi

echo "3) Firestore DB + vector indexes…"
bash create_index.sh

echo "4) bearer-token secret…"
if ! gcloud secrets describe "$SECRET" >/dev/null 2>&1; then
  TOKEN=$(openssl rand -hex 32)
  printf '%s' "$TOKEN" | gcloud secrets create "$SECRET" --data-file=- >/dev/null
  echo "   created secret $SECRET"
fi

echo "5) grant runtime service account roles…"
PROJNUM=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
RUNTIME_SA="${PROJNUM}-compute@developer.gserviceaccount.com"
for ROLE in roles/datastore.user roles/aiplatform.user roles/storage.objectAdmin \
            roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${RUNTIME_SA}" --role="$ROLE" \
    --condition=None >/dev/null 2>&1 || echo "   (could not grant $ROLE — grant manually if deploy fails)"
done

echo "6) deploy to Cloud Run…"
gcloud run deploy "$SERVICE" --source . --region "$REGION" \
  --allow-unauthenticated --min-instances 0 --memory 2Gi --cpu 2 --timeout 600 \
  --service-account "$RUNTIME_SA" \
  --set-secrets "${SECRET}=${SECRET}:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars "GCP_PROJECT=${PROJECT},GCP_REGION=${REGION},ASSET_BUCKET=${BUCKET},FIRESTORE_DB=${DB},FIRESTORE_COLLECTION=${COLL}"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
TOKEN=$(gcloud secrets versions access latest --secret="$SECRET")

cat <<EOF

────────────────────────────────────────────────────────────────────────
✅ SPZ Asset MCP deployed.

   MCP endpoint : ${URL}/mcp
   Health       : ${URL}/healthz
   Bearer token : ${TOKEN}

Add it to Claude Code:
   claude mcp add --transport http spz-assets ${URL}/mcp \\
     --header "Authorization: Bearer ${TOKEN}"

Or paste into an MCP client config:
   {
     "mcpServers": {
       "spz-assets": {
         "url": "${URL}/mcp",
         "headers": { "Authorization": "Bearer ${TOKEN}" }
       }
     }
   }

Note: Firestore vector indexes build in the background — search may return
empty for a few minutes after first deploy. Then backfill:
   python ingest.py --dry-run --limit 20     # preview
   python ingest.py                          # full
────────────────────────────────────────────────────────────────────────
EOF
