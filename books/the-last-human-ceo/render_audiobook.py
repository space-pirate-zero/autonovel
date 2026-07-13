#!/usr/bin/env python3
"""
Render the multi-voice audiobook for *The Last Human CEO* with ElevenLabs.

Space Pirate Zero narrates; the established SPZ brand cast performs the
characters. This is the battle-tested per-segment pipeline from the Maneki Neko
Death Cult production (books/neko-death-cult/tools/record.py): per-role v3
settings, a v3 drop-guard + retry, real silence inserted for [pause] beats, and
ffmpeg stitching — NOT the flaky text_to_dialogue path.

Input : audiobook/scripts/ch{NN}_script.json  (from gen_audiobook_script.py)
Output: audiobook/chapters/ch_NN.mp3           (one file per chapter)
Voices: audiobook_voices.json                  (role -> brand voice + settings)

Usage:
  uv run --with elevenlabs --with python-dotenv python render_audiobook.py            # all chapters that have scripts
  uv run --with elevenlabs --with python-dotenv python render_audiobook.py 1          # chapter 1
  uv run --with elevenlabs --with python-dotenv python render_audiobook.py 1 5        # chapters 1-5
  uv run --with elevenlabs --with python-dotenv python render_audiobook.py --test 1   # first 12 speech segs of ch 1
  uv run --with elevenlabs --with python-dotenv python render_audiobook.py --assemble # stitch all ch_*.mp3 into one
  uv run --with elevenlabs --with python-dotenv python render_audiobook.py --status
"""
import os, re, sys, json, time, argparse, subprocess, tempfile
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env", override=True)

AUDIO_DIR = BASE_DIR / "audiobook"
SCRIPTS_DIR = AUDIO_DIR / "scripts"
OUTPUT_DIR = AUDIO_DIR / "chapters"
VOICES_FILE = BASE_DIR / "audiobook_voices.json"

# Model char caps (stay safely under provider limits) and coalescing target.
CAP = {"eleven_v3": 2800, "eleven_multilingual_v2": 4800}
COALESCE_MAX = 1800          # merge consecutive same-speaker speech up to this
MIN_BYTES_PER_CHAR = 200     # v3 drop-detection floor -> retry if a longish seg comes back tiny
PAUSE_BETWEEN_CALLS = 1.1    # rate limiting
GAP_TURN = 0.30              # silence between consecutive speaker turns
GAP_SCENE = 0.9             # silence for a [pause] / scene-break beat
TAG_RE = re.compile(r'\[[^\]]*\]')
BREAK_RE = re.compile(r'<break\s+time="([\d.]+)s"\s*/>')


def load_voices():
    data = json.loads(VOICES_FILE.read_text())
    roles = {k: v for k, v in data.items() if not k.startswith("_")}
    for k, v in roles.items():
        if v.get("voice_id", "").startswith("REPLACE"):
            sys.exit(f"ERROR: role {k} has a placeholder voice_id. Fix {VOICES_FILE}.")
    if "NARRATOR" not in roles:
        sys.exit("ERROR: no NARRATOR role in audiobook_voices.json")
    return roles


def get_client():
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key:
        sys.exit("ERROR: ELEVENLABS_API_KEY not set (create .env from parent autonovel/.env)")
    from elevenlabs.client import ElevenLabs
    return ElevenLabs(api_key=key)


def is_silence_seg(text):
    """A segment that carries no speakable characters is a pause beat."""
    stripped = TAG_RE.sub("", text or "").replace("<break/>", "").strip()
    return not re.search(r'[A-Za-z0-9]', stripped)


def split_long(text, cap):
    """Split a too-long text on sentence boundaries into <=cap pieces."""
    if len(text) <= cap:
        return [text]
    # keep any leading [tag] on the first piece
    sentences = re.split(r'(?<=[.!?])\s+', text)
    out, cur = [], ""
    for s in sentences:
        if len(cur) + len(s) + 1 > cap and cur:
            out.append(cur.strip())
            cur = ""
        if len(s) > cap:  # a single monster sentence — hard chunk it
            for i in range(0, len(s), cap):
                out.append(s[i:i + cap])
        else:
            cur = (cur + " " + s).strip()
    if cur:
        out.append(cur.strip())
    return out


def build_events(segments, roles):
    """segments [{speaker,text}] -> ordered events: ('speech',role,text) / ('silence',secs)."""
    events = []
    for seg in segments:
        spk = seg.get("speaker", "NARRATOR")
        if spk not in roles:
            spk = "NARRATOR"  # safe fallback — SPZ performs unmapped speakers
        text = (seg.get("text") or "").strip()
        if is_silence_seg(text):
            events.append(("silence", GAP_SCENE))
            continue
        # honor any inline <break time="Xs"/> as real silence, split around it
        parts = BREAK_RE.split(text)
        for i, part in enumerate(parts):
            if i % 2 == 1:
                events.append(("silence", float(part)))
            elif part.strip():
                events.append(("speech", spk, part.strip()))
    return events


def coalesce(events, roles):
    """Merge consecutive same-speaker speech into fewer calls; add turn gaps."""
    merged = []
    for ev in events:
        if (ev[0] == "speech" and merged and merged[-1][0] == "speech"
                and merged[-1][1] == ev[1]
                and len(merged[-1][2]) + len(ev[2]) + 1 <= COALESCE_MAX):
            merged[-1] = ("speech", ev[1], merged[-1][2] + " " + ev[2])
        else:
            merged.append(ev)
    # insert a small gap between two adjacent speech turns by different speakers
    out = []
    for i, ev in enumerate(merged):
        if (out and ev[0] == "speech" and out[-1][0] == "speech"
                and out[-1][1] != ev[1]):
            out.append(("silence", GAP_TURN))
        out.append(ev)
    return out


def make_silence(seconds, out_path):
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
         "-t", f"{max(0.05, seconds):.2f}", "-c:a", "libmp3lame", "-b:a", "128k",
         "-ar", "44100", "-ac", "1", str(out_path)],
        check=True, capture_output=True)


class QuotaExceeded(Exception):
    """ElevenLabs credits exhausted — retrying is pointless; stop cleanly."""


def render_speech(client, role_cfg, text, out_path, tries=4):
    model = role_cfg.get("model_id", "eleven_v3")
    vid = role_cfg["voice_id"]
    vs = role_cfg["voice_settings"]
    clean = TAG_RE.sub("", text).strip()
    send = clean if role_cfg.get("strip") else text
    floor = MIN_BYTES_PER_CHAR * len(clean) if (model == "eleven_v3" and len(clean) > 80) else 0
    best, last = b"", None
    for attempt in range(1, tries + 1):
        try:
            audio = client.text_to_speech.convert(
                voice_id=vid, model_id=model, text=send, voice_settings=vs)
            data = b"".join(x for x in audio)
            if len(data) > len(best):
                best = data
            if data and len(data) >= floor:
                out_path.write_bytes(data)
                return len(data)
            last = f"short {len(data)}b < floor {floor}b (possible v3 drop)"
        except Exception as e:
            last = str(e)
            if "quota_exceeded" in last or "credits remaining" in last:
                raise QuotaExceeded(last)   # hard limit — don't burn retries
        if attempt < tries:
            time.sleep(attempt * 6)
    if best:
        out_path.write_bytes(best)
        return len(best)
    raise RuntimeError(f"tts failed ({role_cfg.get('_name','?')}): {last}")


def render_chapter(ch_num, client, roles, limit=0):
    script_path = SCRIPTS_DIR / f"ch{ch_num:02d}_script.json"
    if not script_path.exists():
        print(f"  Ch {ch_num}: no script ({script_path.name}). Run gen_audiobook_script.py first.")
        return None
    script = json.loads(script_path.read_text())
    title = script.get("title", f"Chapter {ch_num}")
    events = coalesce(build_events(script["segments"], roles), roles)

    if limit:
        trimmed, n = [], 0
        for ev in events:
            trimmed.append(ev)
            if ev[0] == "speech":
                n += 1
                if n >= limit:
                    break
        events = trimmed

    speech = [e for e in events if e[0] == "speech"]
    total_chars = sum(len(e[2]) for e in speech)
    used = sorted({e[1] for e in speech})
    print(f"  Ch {ch_num}: '{title}' — {len(speech)} calls, ~{total_chars:,} chars, voices: {used}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix=f"tlhc_ch{ch_num:02d}_"))
    parts, idx, call = [], 0, 0
    for ev in events:
        idx += 1
        if ev[0] == "silence":
            p = tmp / f"sil_{idx:04d}.mp3"
            make_silence(ev[1], p)
            parts.append(p)
            continue
        _, role, txt = ev
        cfg = dict(roles[role]); cfg["_name"] = role
        cap = CAP.get(cfg.get("model_id", "eleven_v3"), 2800)
        for piece in split_long(txt, cap):
            call += 1
            p = tmp / f"seg_{idx:04d}_{call:04d}.mp3"
            print(f"    [{call}/{len(speech)}] {role:8} {len(piece):4}c...", end="", flush=True)
            n = render_speech(client, cfg, piece, p)
            print(f" ok ({n:,}b)")
            parts.append(p)
            time.sleep(PAUSE_BETWEEN_CALLS)

    suffix = "_test" if limit else ""
    out_mp3 = OUTPUT_DIR / f"ch_{ch_num:02d}{suffix}.mp3"
    listing = tmp / "list.txt"
    listing.write_text("".join(f"file '{p}'\n" for p in parts))
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
         "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "1", str(out_mp3)],
        check=True, capture_output=True)
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nk=1:nw=1", str(out_mp3)], capture_output=True, text=True).stdout.strip() or 0)
    mb = out_mp3.stat().st_size / (1024 * 1024)
    print(f"  -> {out_mp3.name}  {mb:.1f} MB  {dur/60:.1f} min\n")
    return out_mp3


def assemble():
    files = sorted(f for f in OUTPUT_DIR.glob("ch_*.mp3") if "_test" not in f.name)
    if not files:
        print("No chapter mp3s to assemble."); return
    tmp = Path(tempfile.mkdtemp(prefix="tlhc_full_"))
    listing = tmp / "list.txt"
    listing.write_text("".join(f"file '{f}'\n" for f in files))
    out = AUDIO_DIR / "The_Last_Human_CEO_full.mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
         "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "1", str(out)],
        check=True, capture_output=True)
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nk=1:nw=1", str(out)], capture_output=True, text=True).stdout.strip() or 0)
    mb = out.stat().st_size / (1024 * 1024)
    print(f"Full audiobook: {out}  ({len(files)} chapters, {mb:.1f} MB, {dur/3600:.2f} h)")


def status():
    scripts = sorted(SCRIPTS_DIR.glob("ch*_script.json"))
    print(f"{'ch':>3}  {'script':>7}  {'audio':>9}")
    for s in scripts:
        n = int(re.search(r'ch(\d+)_script', s.name).group(1))
        a = OUTPUT_DIR / f"ch_{n:02d}.mp3"
        astr = f"{a.stat().st_size/1e6:.1f}MB" if a.exists() else "—"
        print(f"{n:>3}  {'ok':>7}  {astr:>9}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("start", nargs="?", type=int)
    ap.add_argument("end", nargs="?", type=int)
    ap.add_argument("--test", type=int, metavar="CH", help="render first 12 speech segs of a chapter")
    ap.add_argument("--assemble", action="store_true")
    ap.add_argument("--no-assemble", action="store_true", help="render range only; skip stitching the full book")
    ap.add_argument("--status", action="store_true")
    args = ap.parse_args()

    if args.status:
        status(); return
    if args.assemble:
        assemble(); return

    roles = load_voices()
    client = get_client()

    if args.test:
        render_chapter(args.test, client, roles, limit=12)
        return

    scripts = sorted(SCRIPTS_DIR.glob("ch*_script.json"))
    if not scripts:
        sys.exit("No scripts found. Run gen_audiobook_script.py first.")
    nums = [int(re.search(r'ch(\d+)_script', s.name).group(1)) for s in scripts]
    start = args.start or min(nums)
    end = args.end or max(nums)
    force = os.environ.get("FORCE_RENDER") == "1"
    print(f"Rendering chapters {start}-{end}\n")
    try:
        for n in range(start, end + 1):
            if not (SCRIPTS_DIR / f"ch{n:02d}_script.json").exists():
                continue
            done = OUTPUT_DIR / f"ch_{n:02d}.mp3"
            if done.exists() and not force:
                print(f"  Ch {n}: audio exists ({done.stat().st_size/1e6:.1f}MB), skipping (FORCE_RENDER=1 to redo)")
                continue
            render_chapter(n, client, roles)
    except QuotaExceeded as e:
        print("\n" + "=" * 66)
        print("STOPPED: ElevenLabs credits exhausted (quota_exceeded).")
        print(f"  {e}")
        print("  Add credits / raise the plan quota, then re-run this exact command —")
        print("  it resumes at the first un-rendered chapter (nothing already done is re-billed).")
        print("=" * 66)
        sys.exit(3)
    if not args.no_assemble:
        assemble()


if __name__ == "__main__":
    main()
