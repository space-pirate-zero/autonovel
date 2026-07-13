#!/usr/bin/env bash
# Finish the audiobook once ElevenLabs credits are topped up.
# Fully resume-safe: re-run any time; nothing already done is redone/re-billed.
#   1. parse the still-unparsed chapters (21-28 + coda)
#   2. render the remaining narration (15-28 + coda) — resumes at ch15
#   3. produce every chapter with the theme + spoken intro
#   4. stitch the whole thing into one tagged audiobook
#
# If credits run out again mid-way, render_audiobook stops cleanly with a
# quota message (exit 3) — add more credits and re-run this same script.
set -uo pipefail
cd "$(dirname "$0")"

echo "===== PARSE Ch 21-29 (Act 3 + coda) ====="
uv run --with httpx --with python-dotenv python gen_audiobook_script.py 21 29

echo "===== RENDER remaining narration (resumes at first missing) ====="
uv run --with elevenlabs --with python-dotenv python render_audiobook.py 15 29 --no-assemble
rc=$?
if [ $rc -eq 3 ]; then
  echo ">>> Stopped: ElevenLabs credits exhausted again. Add credits and re-run finish_book.sh."
  exit 3
fi

echo "===== PRODUCE all chapters (theme + intros) ====="
uv run --with python-dotenv python produce_chapter.py all

# NOTE: publishing per chapter — the per-chapter audiobook/produced/ch_NN_PRODUCED.mp3
# files ARE the deliverables. No combined-book assembly. (produce_chapter.py --assemble
# still exists if a single file is ever wanted.)

echo "===== DONE ====="
uv run --with elevenlabs --with python-dotenv python render_audiobook.py --status
