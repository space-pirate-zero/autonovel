#!/usr/bin/env python3
"""
Assemble a fully-produced episode: produced OPEN + narration scored scene-by-scene
with the instrumental beds (ducked under the voice) + needle-lift SFX + theme tail.

Scene timestamps are reconstructed analytically from the voice length and the script
(no cached cells needed). MUSIC cues in ch_NN.audio.md name the scene → bed mapping.

Usage (run from the book dir):  uv run python tools/assemble.py NN
"""
import sys, subprocess, tempfile
from pathlib import Path
sys.path.insert(0, "tools")
import mix

NN = sys.argv[1] if len(sys.argv) > 1 else "01"
B = Path("audio/music"); A = Path("audio/assets")
VOICE = Path(f"audio/ch_{NN}.voice.mp3")
OPEN = Path(f"audio/produced/ep{NN}_open.mp3")
OUT = Path(f"audio/produced/ep{NN}_FINAL.mp3")
SCRIPT = Path(f"chapters/ch_{NN}.audio.md")
SR = "48000"; TAIL = 12.0

BEDMAP = [("vault", "vault_bed.mp3"), ("cathedral", "cathedral_bed.mp3"),
          ("motel", "motel_bed.mp3"), ("dread", "motel_bed.mp3"),
          ("cosmic", "cosmic_bed.mp3"), ("europa", "europa_bed.mp3"),
          ("outro", "main_theme.mp3"), ("theme", "main_theme.mp3")]
def bed_for(x):
    x = x.lower()
    for k, f in BEDMAP:
        if k in x:
            return B / f
    return None


def seamless_loop(src, out, length, vol, tmp, xf=3.0, fin=4.0, fout=4.0):
    """Loop `src` to `length` seconds with crossfades at the loop seams (no clicks)."""
    cur = tmp / (out.stem + "_s0.wav")
    subprocess.run(["ffmpeg", "-y", "-i", str(src), "-ar", SR, "-ac", "2", str(cur)],
                   check=True, capture_output=True)
    i = 0
    while mix.dur_of(cur) < length + xf and i < 7:
        nxt = tmp / (out.stem + f"_s{i+1}.wav")
        subprocess.run(["ffmpeg", "-y", "-i", str(cur), "-i", str(cur), "-filter_complex",
                        f"[0:a][1:a]acrossfade=d={xf}:c1=tri:c2=tri", "-ar", SR, "-ac", "2", str(nxt)],
                       check=True, capture_output=True)
        cur = nxt; i += 1
    fo = min(fout, length / 2)
    subprocess.run(["ffmpeg", "-y", "-i", str(cur), "-t", f"{length:.2f}", "-af",
                    f"volume={vol},afade=t=in:st=0:d={fin},afade=t=out:st={max(0,length-fo):.2f}:d={fo}",
                    "-ar", SR, "-ac", "2", str(out)], check=True, capture_output=True)
    return out


V = mix.dur_of(VOICE)
events = mix.parse_with_cues(SCRIPT.read_text())
tot_sil = sum(e[1] for e in events if e[0] == "silence")
tot_ch = sum(len(e[2]) for e in events if e[0] == "speech")
rate = (V - tot_sil) / tot_ch
t, cues = 0.0, []
for e in events:
    if e[0] == "cue":
        cues.append((t, e[1]))
    elif e[0] == "silence":
        t += e[1]
    else:
        t += len(e[2]) * rate

mus = [(ct, tx) for ct, tx in cues if "music:" in tx.lower()]
spans = []
for i, (ct, tx) in enumerate(mus):
    bed = bed_for(tx)
    if not bed:
        continue
    end = mus[i + 1][0] if i + 1 < len(mus) else V + TAIL
    spans.append((bed, ct, end, tx))

nl = A / "needle_lift.mp3"
sfx = [ct for ct, tx in cues if nl.exists() and "sfx" in tx.lower() and "needle lift" in tx.lower()]

print(f"voice {V:.0f}s · rate {rate:.4f}s/char · {len(spans)} bed spans · {len(sfx)} SFX")
for bed, s0, s1, tx in spans:
    print(f"  {s0:7.1f}–{s1:7.1f}s  {bed.name:15} <- {tx.strip('[] ')[:38]}")

tmp = Path(tempfile.mkdtemp(prefix="mndcasm_"))
BODY = V + TAIL
inputs = ["-i", str(VOICE)]; filt = []; idx = 1; beds = []; sfxl = []
XF = 4.0  # crossfade window: each bed starts XF/2 early & ends XF/2 late so neighbours overlap
for bed, s0, s1, tx in spans:
    sp = tmp / f"bed_{idx}.wav"
    start = max(0.0, s0 - XF / 2)
    length = (s1 - s0) + XF
    seamless_loop(bed, sp, max(2.0, length), 0.30, tmp, xf=3.0, fin=XF, fout=XF)
    inputs += ["-i", str(sp)]
    filt.append(f"[{idx}:a]adelay={int(start*1000)},aformat=channel_layouts=stereo:sample_rates={SR}[b{idx}]")
    beds.append(f"[b{idx}]"); idx += 1
for ct in sfx:
    inputs += ["-i", str(nl)]
    filt.append(f"[{idx}:a]adelay={int(ct*1000)},aformat=channel_layouts=stereo:sample_rates={SR},volume=0.4[b{idx}]")
    sfxl.append(f"[b{idx}]"); idx += 1

filt.append("".join(beds) + f"amix=inputs={len(beds)}:duration=longest:normalize=0,apad=whole_dur={BODY:.2f}[beds]")
filt.append(f"[0:a]aformat=channel_layouts=stereo:sample_rates={SR},asplit=2[v1][v2]")
filt.append("[beds][v1]sidechaincompress=threshold=0.05:ratio=4:attack=60:release=900[bedsd]")
filt.append(f"[v2][bedsd]{''.join(sfxl)}amix=inputs={2+len(sfxl)}:duration=longest:normalize=0,"
            f"afade=t=out:st={BODY-4:.2f}:d=4,alimiter=limit=0.97[body]")

body = tmp / "body.mp3"
r = subprocess.run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(filt),
                    "-map", "[body]", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", SR, "-ac", "2", str(body)],
                   capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr[-2500:]); sys.exit("body mix failed")

r2 = subprocess.run(["ffmpeg", "-y", "-i", str(OPEN), "-i", str(body), "-filter_complex",
                     "[0:a][1:a]acrossfade=d=4:c1=qsin:c2=qsin,alimiter=limit=0.97[out]",
                     "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", SR, "-ac", "2", str(OUT)],
                    capture_output=True, text=True)
if r2.returncode != 0:
    print(r2.stderr[-2500:]); sys.exit("concat failed")
print(f"\nFINAL → {OUT}  {mix.dur_of(OUT):.0f}s ({mix.dur_of(OUT)/60:.1f} min)  {OUT.stat().st_size/1e6:.1f}MB")
