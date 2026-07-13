#!/usr/bin/env bash
# Act 1 driver: parse slots 0-9 (front matter + ch 1-9), then render them.
# No full-book assembly yet. Safe to re-run: parsing overwrites scripts,
# rendering overwrites chapter mp3s.
set -euo pipefail
cd "$(dirname "$0")"

echo "===== PARSE slots 0-9 ====="
uv run --with httpx --with python-dotenv python gen_audiobook_script.py 0 9

echo "===== RENDER slots 0-9 ====="
uv run --with elevenlabs --with python-dotenv python render_audiobook.py 0 9 --no-assemble

echo "===== ACT 1 DONE ====="
uv run --with elevenlabs --with python-dotenv python render_audiobook.py --status
