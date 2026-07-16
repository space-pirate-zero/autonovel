#!/usr/bin/env bash
# create_index.sh — create the Firestore database + vector indexes for the catalog.
# Idempotent: "already exists" errors are tolerated. Index builds run in the
# background and can take a few minutes before find_nearest works.
set -euo pipefail
cd "$(dirname "$0")"
cfg(){ python3 -c "import json;print(json.load(open('config.json'))$1)"; }
PROJECT=$(cfg "['gcp']['project']"); REGION=$(cfg "['gcp']['region']")
DB=$(cfg "['gcp']['firestore_db']"); COLL=$(cfg "['gcp']['collection']")
DIM=$(cfg "['models']['embedding_dim']")

gcloud config set project "$PROJECT" >/dev/null

echo "ensuring Firestore database '$DB' (native mode, $REGION)…"
if ! gcloud firestore databases describe --database="$DB" >/dev/null 2>&1; then
  gcloud firestore databases create --database="$DB" \
    --location="$REGION" --type=firestore-native
fi

mk_index(){  # $1 = human label; remaining args = extra --field-config flags (filter fields)
  local label="$1"; shift
  echo "  index: $label"
  gcloud firestore indexes composite create \
    --database="$DB" --collection-group="$COLL" --query-scope=COLLECTION \
    "$@" \
    --field-config="field-path=embedding,vector-config={\"dimension\":${DIM},\"flat\":{}}" \
    2>&1 | grep -v -i "already exists" || true
}

# Plain KNN + the common filtered-KNN combos (property / type). If a query needs
# another composite (e.g. tag+embedding), Firestore returns a ready-to-run
# `gcloud firestore indexes composite create …` command in the error — run that.
mk_index "embedding (plain KNN)"
mk_index "property + embedding"  --field-config="order=ASCENDING,field-path=property"
mk_index "type + embedding"      --field-config="order=ASCENDING,field-path=type"

echo "done. (indexes build in the background — check: gcloud firestore indexes composite list --database=$DB)"
