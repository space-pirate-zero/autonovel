#!/usr/bin/env python3
"""
Layer music + SFX onto an already-rendered episode voice track.

Reuses record.py's parser so cue timestamps align exactly with the voice, then
generates assets via ElevenLabs (Sound Effects + Music), positions SFX at their
cue points, ducks looping music beds under their spans, and mixes with ffmpeg.

Voice timing comes from the cached render cells (newest /tmp/mndc_* with list.txt),
so the NARRATION IS NOT RE-RENDERED. Assets are cached in audio/assets/.

Usage: source ../../.env && uv run --with elevenlabs python tools/mix.py chapters/ch_01.audio.md
"""
import os, re, sys, glob, json, subprocess, tempfile
from pathlib import Path
import record  # reuse parse_events / coalesce / regexes

SR = "44100"
ASSET_DIR = None  # set in main


def dur_of(p):
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nk=1:nw=1", str(p)], capture_output=True, text=True).stdout.strip() or 0)


# ---- parsing with cues (mirrors record.parse_events, but keeps SFX/MUSIC cues) ----
def parse_with_cues(text):
    out = []
    cur_spk, cur_txt = None, []

    def flush():
        nonlocal cur_spk, cur_txt
        if cur_spk and cur_txt:
            record._emit_segment(cur_spk, " ".join(cur_txt).strip(), out)
        cur_spk, cur_txt = None, []

    for raw in text.splitlines():
        s = raw.strip()
        m = record.SPK_RE.match(s)
        if m:
            flush(); cur_spk, cur_txt = m.group(1), [m.group(2)]
        elif s.startswith("[[") or s == "":
            flush()
            if s.startswith("[[") and ("SFX:" in s or "MUSIC:" in s):
                out.append(("cue", s))
            for d in record.BREAK_RE.findall(s):
                out.append(("silence", float(d)))
        elif cur_spk:
            cur_txt.append(s)
    flush()
    return out


def coalesce_map(events, max_chars=record.COALESCE_MAX):
    cells, owner = [], []
    for ev in events:
        if (ev[0] == "speech" and cells and cells[-1][0] == "speech"
                and cells[-1][1] == ev[1]
                and len(cells[-1][2]) + len(ev[2]) + 1 <= max_chars):
            cells[-1] = ("speech", ev[1], cells[-1][2] + " " + ev[2]); owner.append(len(cells) - 1)
        else:
            cells.append(ev); owner.append(len(cells) - 1)
    return cells, owner


# ---- asset generation (cached) ----
def sfx(client, name, prompt, seconds):
    p = ASSET_DIR / f"{name}.wav"
    if p.exists():
        return p
    raw = ASSET_DIR / f"_{name}.mp3"
    audio = client.text_to_sound_effects.convert(text=prompt, duration_seconds=seconds)
    raw.write_bytes(b"".join(x for x in audio))
    subprocess.run(["ffmpeg", "-y", "-i", str(raw), "-ar", SR, "-ac", "1", str(p)],
                   check=True, capture_output=True)
    return p


def music(client, name, prompt, ms):
    p = ASSET_DIR / f"{name}.wav"
    if p.exists():
        return p
    raw = ASSET_DIR / f"_{name}.mp3"
    audio = client.music.compose(prompt=prompt, music_length_ms=ms, force_instrumental=True)
    raw.write_bytes(b"".join(x for x in audio))
    subprocess.run(["ffmpeg", "-y", "-i", str(raw), "-ar", SR, "-ac", "1", str(p)],
                   check=True, capture_output=True)
    return p


def bed_span(src, out, dur, vol, fin=1.5, fout=2.5):
    fout = min(fout, dur / 2)
    subprocess.run(
        ["ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src), "-t", f"{dur:.2f}",
         "-af", f"volume={vol},afade=t=in:st=0:d={fin},afade=t=out:st={max(0,dur-fout):.2f}:d={fout}",
         "-ar", SR, "-ac", "1", str(out)], check=True, capture_output=True)
    return out


def main():
    global ASSET_DIR
    script = Path(sys.argv[1])
    book = script.parent.parent
    ASSET_DIR = book / "audio" / "assets"; ASSET_DIR.mkdir(parents=True, exist_ok=True)
    voice_src = book / "audio" / f"{script.stem.replace('.audio','')}.mp3"
    voice = book / "audio" / f"{script.stem.replace('.audio','')}.voice.mp3"
    if not voice.exists():
        subprocess.run(["cp", str(voice_src), str(voice)], check=True)  # preserve voice-only
    out_mp3 = voice_src

    # cached render cells → per-cell durations (voice timeline)
    cand = sorted(glob.glob(os.path.expandvars("$TMPDIR/mndc_*")) +
                  glob.glob("/var/folders/*/*/T/mndc_*") + glob.glob("/tmp/mndc_*"),
                  key=lambda d: os.path.getmtime(d), reverse=True)
    cand = [d for d in cand if os.path.exists(os.path.join(d, "list.txt"))]
    if not cand:
        sys.exit("No cached render cells found (need newest /tmp/mndc_*/list.txt). Re-run record.py first.")
    cells_files = [l.strip()[6:-1] for l in open(os.path.join(cand[0], "list.txt")) if l.strip()]
    durs = [dur_of(f) for f in cells_files]
    starts = [sum(durs[:i]) for i in range(len(durs) + 1)]  # starts[i] = time before cell i; [-1]=total
    T = starts[-1]

    txt = script.read_text()
    tokens = parse_with_cues(txt)
    clean = [t for t in tokens if t[0] != "cue"]
    assert clean == record.parse_events(txt), "clean stream diverged from record.parse_events"
    cells, owner = coalesce_map(clean)
    assert len(cells) == len(durs), f"cell count {len(cells)} != cached cells {len(durs)}"

    # assign each cue a time (start of the cell it precedes)
    cues = []
    j = 0
    for t in tokens:
        if t[0] == "cue":
            ci = owner[j] if j < len(owner) else len(cells)
            cues.append((starts[ci] if ci < len(starts) else T, t[1]))
        else:
            j += 1

    from elevenlabs.client import ElevenLabs
    import hashlib
    client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
    def hh(s): return hashlib.md5(s.encode()).hexdigest()[:10]

    # fixed shared assets (same across every episode)
    STING = sfx(client, "sting", "a sheet of paper tearing crisply, then a vinyl record needle dropping onto a spinning groove with a warm crackle", 2.5)
    NEEDLE = sfx(client, "needle_lift", "a phonograph tonearm lifting off a vinyl record, a brief crackle then quiet", 1.2)
    UNDER = music(client, "bed_under", "a very quiet minimal subliminal dark ambient drone, sparse and almost inaudible, no melody, no drums, a faint low hum of tension under spoken-word narration", 24000)

    def desc_after(c):
        d = re.split(r'(?i)(?:SFX|MUSIC)\s*:', c.strip().strip("[]").strip(), 1)[-1].strip()
        d = re.sub(r'(?i)^\s*shift[\s—-]*', '', d)
        d = re.sub(r'(?i)[,\s—-]*\b(begins under|begins|up|under)\b\.?\s*$', '', d)
        return d.strip(" —-,")

    # Episode-agnostic: build music spans from a bed stack; SFX from cue text.
    sfx_hits = []                      # (time, path, vol)
    mus_spans = []                     # (path, start, end, vol)
    cur_path, cur_start = None, None
    for t, c in cues:
        low = c.lower()
        if "music:" in low:
            if re.search(r'\bout\b', low) and "outro" not in low:
                if cur_path is not None:
                    mus_spans.append((cur_path, cur_start, t, 0.17)); cur_path = None
            else:
                if cur_path is not None:
                    mus_spans.append((cur_path, cur_start, t, 0.17))
                d = desc_after(c)
                cur_path = music(client, "bed_" + hh(d), d, 30000)
                cur_start = t
        else:
            if "sting" in low:
                sfx_hits.append((t, STING, 0.55))
            elif "needle lift" in low:
                sfx_hits.append((t, NEEDLE, 0.42))
            else:
                d = desc_after(c)
                secs = 4.0 if re.search(r'(?i)ambience|birdsong|room tone|cutlery', low) else 2.0
                sfx_hits.append((t, sfx(client, "sfx_" + hh(d), d, secs), 0.5))
    if cur_path is not None:
        mus_spans.append((cur_path, cur_start, T, 0.19))

    spans = [(UNDER, 0.0, T, 0.09)] + mus_spans   # (path, s0, s1, vol)

    tmp = Path(tempfile.mkdtemp(prefix="mndcmix_"))
    inputs = ["-i", str(voice)]
    filt = []
    idx = 1
    for src, s0, s1, vol in spans:
        span = tmp / f"bed_{idx}.wav"
        fades = (3.0, 4.0) if idx == 1 else (1.5, 2.5)
        bed_span(src, span, max(2.0, s1 - s0), vol, fin=fades[0], fout=fades[1])
        inputs += ["-i", str(span)]
        filt.append(f"[{idx}:a]adelay={int(s0*1000)}[b{idx}]")
        idx += 1
    for t, src, vol in sfx_hits:
        inputs += ["-i", str(src)]
        filt.append(f"[{idx}:a]adelay={int(t*1000)},volume={vol}[b{idx}]")
        idx += 1
    mixlabels = "".join(f"[b{k}]" for k in range(1, idx))
    filt.append(f"[0:a]{mixlabels}amix=inputs={idx}:duration=first:normalize=0,alimiter=limit=0.97[out]")
    cmd = ["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(filt),
           "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "160k", "-ar", SR, "-ac", "1", str(out_mp3)]
    print(f"voice {T:.0f}s · {len(spans)} beds · {len(sfx_hits)} SFX hits · {idx-1} overlays")
    for src, s0, s1, vol in spans: print(f"  bed {s0:6.1f}s → {s1:6.1f}s  vol {vol}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1500:]); sys.exit("ffmpeg mix failed")
    print(f"MIXED → {out_mp3}  ({out_mp3.stat().st_size/1e6:.1f} MB, {dur_of(out_mp3):.0f}s)")


if __name__ == "__main__":
    main()
