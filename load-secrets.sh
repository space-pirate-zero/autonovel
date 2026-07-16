#!/usr/bin/env bash
# load-secrets.sh — rebuild the autonovel/SPZ .env from Google Secret Manager.
#
#   ./load-secrets.sh              # print KEY='value' lines to stdout
#   ./load-secrets.sh > .env       # regenerate the .env file
#   eval "$(./load-secrets.sh)"    # export them into the current shell
#
# Project defaults to the active gcloud project; override with:  ./load-secrets.sh <project>
#
# Note: FAL_KEY (placeholder) and SPZ_SUBSTACK_CONNECT_SID (empty) are NOT in
# Secret Manager — add them by hand if you need them.
set -euo pipefail
PROJECT="${1:-$(gcloud config get-value project 2>/dev/null)}"

KEYS=(
  ANTHROPIC_API_KEY AUTONOVEL_BOOK_TITLE AUTONOVEL_WRITER_MODEL
  AUTONOVEL_JUDGE_MODEL AUTONOVEL_REVIEW_MODEL AUTONOVEL_API_BASE_URL
  ELEVENLABS_API_KEY SUBSTACK_PUBLICATION_URL SUBSTACK_EMAIL SUBSTACK_PASSWORD
  GEMINI_API_KEY SPZ_SUBSTACK_SID SPZ_SUBSTACK_LLI SPZ_SUBSTACK_PUBLICATION_URL
  SPZ_SUBSTACK_CF_CLEARANCE SPZ_SUBSTACK_USER_AGENT
)

echo "# Generated from Google Secret Manager (project: $PROJECT)"
for KEY in "${KEYS[@]}"; do
  if val=$(gcloud secrets versions access latest --secret="$KEY" --project="$PROJECT" 2>/dev/null); then
    esc=${val//\'/\'\\\'\'}          # single-quote-safe escaping
    printf "%s='%s'\n" "$KEY" "$esc"
  else
    echo "# WARN: $KEY not found in Secret Manager" >&2
  fi
done
