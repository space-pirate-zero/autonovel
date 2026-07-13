#!/usr/bin/env bash
# Act 2 (Ch 10-20) — parse -> render -> produce, end to end.
# Resume-safe: parsing skips existing scripts, rendering skips existing chapter
# mp3s, producing skips existing produced files. Safe to re-run after any stop.
set -euo pipefail
cd "$(dirname "$0")"

A=10 ; B=20

echo "===== PARSE Ch $A-$B ====="
uv run --with httpx --with python-dotenv python gen_audiobook_script.py $A $B

echo "===== RENDER Ch $A-$B ====="
uv run --with elevenlabs --with python-dotenv python render_audiobook.py $A $B --no-assemble

echo "===== PRODUCE Ch $A-$B (theme + final touches) ====="
uv run --with python-dotenv python produce_chapter.py $A $B

echo "===== ACT 2 DONE ====="
uv run --with elevenlabs --with python-dotenv python render_audiobook.py --status
