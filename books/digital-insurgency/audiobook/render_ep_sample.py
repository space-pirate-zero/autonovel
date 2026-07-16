#!/usr/bin/env python3
"""
Render a listenable multi-voice audiobook SAMPLE of a Digital Insurgency episode
directly from its markdown script via the ElevenLabs REST TTS API.

Parses audiobook/scripts/ep_NN.md into ordered (speaker, text) segments, renders
each via TTS, and concatenates them (with short silences) into
audiobook/produced/ep_NN_SAMPLE.mp3 using ffmpeg's concat demuxer.

Env: ELEVENLABS_API_KEY must be set.
Usage: python render_ep_sample.py [NN]   (default NN=01)
"""
import os
import re
import sys
import json
import time
import subprocess
import tempfile
import urllib.request
import urllib.error
from pathlib import Path

BASE = Path(__file__).parent                      # .../audiobook
SCRIPTS = BASE / "scripts"
PRODUCED = BASE / "produced"
VOICES_FILE = BASE / "audiobook_voices.json"

MODEL_ID = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.4, "similarity_boost": 0.75}
SILENCE_SEC = 0.4
PAUSE_BETWEEN_CALLS = 1.0

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")


def load_voices():
    data = json.loads(VOICES_FILE.read_text())
    out = {}
    for name, info in data.items():
        if name.startswith("_"):
            continue
        vid = info.get("voice_id", "")
        if vid and vid != "REPLACE_WITH_VOICE_ID":
            out[name] = vid
    return out


def clean_text(text):
    """Strip bracketed delivery tags and backticks; keep spoken words."""
    # Drop bracketed delivery tags like [softly], [pause], [flatly]
    text = re.sub(r"\[[^\]]*\]", " ", text)
    # Drop backticks around config/log lines but keep the words
    text = text.replace("`", "")
    # Config tokens like MATCH_DELAY_ENGINE -> read as separate words
    text = text.replace("_", " ")
    # Drop markdown emphasis asterisks
    text = re.sub(r"\*{1,3}", "", text)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_script(md_path):
    """Return ordered list of {speaker, text}. Drops score cues, headers,
    metadata block, and trailing recording-notes HTML comment."""
    raw = md_path.read_text()

    # Remove HTML comment blocks (recording notes)
    raw = re.sub(r"<!--.*?-->", "", raw, flags=re.DOTALL)

    lines = raw.splitlines()
    segments = []
    current_speaker = None
    buffer = []
    started = False  # only start collecting after first speaker line

    speaker_re = re.compile(r"^(NARRATOR|SPZ|ZERO|GHOST|BISHOP|SARAH|KEISHA|COUNCIL|BOSS)\s*:\s*(.*)$")

    def flush():
        nonlocal buffer, current_speaker
        if current_speaker and buffer:
            joined = " ".join(buffer)
            spoken = clean_text(joined)
            if spoken:
                segments.append({"speaker": current_speaker, "text": spoken})
        buffer = []

    for line in lines:
        stripped = line.strip()
        # Drop score cue lines and blockquotes
        if stripped.startswith(">"):
            continue
        # Drop section headers and top title
        if stripped.startswith("#"):
            continue
        # Drop horizontal rules
        if stripped == "---" or stripped == "```":
            continue
        # Drop pure italic metadata lines before first speaker
        m = speaker_re.match(stripped)
        if m:
            # new speaker turn
            flush()
            current_speaker = m.group(1)
            started = True
            rest = m.group(2)
            if rest.strip():
                buffer.append(rest)
            continue
        if not started:
            continue
        if not stripped:
            # blank line = end of turn's paragraph but keep speaker;
            # flush current turn so silences land between paragraphs
            flush()
            continue
        buffer.append(stripped)

    flush()

    # Map SPZ -> NARRATOR voice slot (single storyteller voice per cast note)
    for s in segments:
        if s["speaker"] == "SPZ":
            s["voice_key"] = "NARRATOR"
        else:
            s["voice_key"] = s["speaker"]
    return segments


def tts(voice_id, text, out_path, max_retries=3):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    body = json.dumps({
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": VOICE_SETTINGS,
    }).encode("utf-8")
    for attempt in range(1, max_retries + 1):
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("xi-api-key", API_KEY)
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "audio/mpeg")
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = resp.read()
            if data and len(data) > 200:
                out_path.write_bytes(data)
                return len(data)
            raise RuntimeError(f"empty audio ({len(data)} bytes)")
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", "ignore")[:300]
            print(f"    HTTP {e.code}: {err}", file=sys.stderr)
            if attempt < max_retries:
                time.sleep(attempt * 8)
        except Exception as e:
            print(f"    err: {e}", file=sys.stderr)
            if attempt < max_retries:
                time.sleep(attempt * 8)
    return 0


def main():
    ep = sys.argv[1] if len(sys.argv) > 1 else "01"
    ep = ep.zfill(2)
    if not API_KEY:
        print("ERROR: ELEVENLABS_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    md_path = SCRIPTS / f"ep_{ep}.md"
    segments = parse_script(md_path)
    voices = load_voices()
    print(f"Parsed {len(segments)} segments from {md_path.name}")
    total_chars = sum(len(s["text"]) for s in segments)
    print(f"Total spoken chars: {total_chars}")
    by_speaker = {}
    for s in segments:
        by_speaker[s["voice_key"]] = by_speaker.get(s["voice_key"], 0) + 1
    print(f"Segments by voice: {by_speaker}")

    PRODUCED.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix=f"ep{ep}_"))
    print(f"Temp dir: {tmp}")

    # Silence file (0.4s, mp3) for spacing between turns
    silence = tmp / "silence.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i",
        f"anullsrc=r=44100:cl=mono", "-t", str(SILENCE_SEC),
        "-q:a", "9", str(silence)
    ], check=True, capture_output=True)

    part_files = []
    for i, seg in enumerate(segments, 1):
        vid = voices.get(seg["voice_key"]) or voices.get("NARRATOR")
        out = tmp / f"seg_{i:03d}.mp3"
        n = tts(vid, seg["text"], out)
        status = f"{n:,}B" if n else "FAILED"
        print(f"  [{i:3d}/{len(segments)}] {seg['voice_key']:8s} {len(seg['text']):4d}ch -> {status}")
        if n:
            part_files.append(out)
            part_files.append(silence)
        time.sleep(PAUSE_BETWEEN_CALLS)

    if not part_files:
        print("ERROR: no audio rendered", file=sys.stderr)
        sys.exit(1)

    # Build concat list
    concat_list = tmp / "concat.txt"
    concat_list.write_text("".join(f"file '{p}'\n" for p in part_files))

    out_mp3 = PRODUCED / f"ep_{ep}_SAMPLE.mp3"
    # Re-encode to a uniform stream so the concat is clean/seekable
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list),
        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "1",
        str(out_mp3)
    ], check=True, capture_output=True)

    size = out_mp3.stat().st_size
    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(out_mp3)],
        capture_output=True, text=True
    ).stdout.strip()
    print(f"\nDONE: {out_mp3}")
    print(f"Size: {size/1024/1024:.2f} MB")
    print(f"Duration: {dur} s")


if __name__ == "__main__":
    main()
