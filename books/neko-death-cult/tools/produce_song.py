#!/usr/bin/env python3
"""
produce_song.py — fully produce a door's song: the sung VOX track + that door's
spoken samples placed CLEAN in the instrumental pockets (album.md sampling rule:
samples ride the beat in the gaps, never over a sung line).

Method:
  1. demucs --two-stems=vocals on the VOX song -> vocals / no_vocals stems.
  2. silencedetect on the vocal stem -> the instrumental pockets (gaps).
  3. Build a clean INTRO pocket from the no_vocals stem (the song sings early),
     prepend it seamlessly so the SPZ thesis line has clean room up front.
  4. Place the SPZ line in the intro pocket, the Kat lines in the detected gaps
     (time-compressed only if needed so they never overlap the vocal), the last
     one pitched-down + reverbed as a haunted outro.
  5. Master to ~-10 LUFS, 192k.

Usage:
  export PATH="$HOME/.local/bin:$PATH"           # demucs + ffmpeg
  python3 tools/produce_song.py 14
"""
import subprocess, sys, pathlib, re, glob, os

HERE = pathlib.Path(__file__).resolve().parent
NDC  = HERE.parent
SONGS = NDC/"audio/songs"; SAMP = NDC/"audio/samples"
PROD = NDC/"audio/produced"; PROD.mkdir(parents=True, exist_ok=True)
WORK = pathlib.Path("/tmp/neko_produce"); WORK.mkdir(exist_ok=True)
DL = pathlib.Path.home()/"Downloads"
REVIEW = pathlib.Path.home()/"Library"/"Mobile Documents"/"com~apple~CloudDocs"/"a+_neko"/"review"
REVIEW.mkdir(parents=True, exist_ok=True)

def run(a): subprocess.run(a, check=True)
def ff(*a): run(["ffmpeg","-y","-v","error",*a])
def dur(p):
    r=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(p)],
                     capture_output=True,text=True)
    try: return float(r.stdout.strip())
    except: return 0.0

def vox_song(n):
    hits=sorted(SONGS.glob(f"track{n:02d}_*_VOX.mp3"))
    if not hits: sys.exit(f"no VOX song for door {n} (run compose_songs.py {n} first)")
    return hits[0]

def separate(song):
    out=WORK/song.stem
    voc=out/"htdemucs"/song.stem/"vocals.wav"
    nov=out/"htdemucs"/song.stem/"no_vocals.wav"
    fresh = voc.exists() and nov.exists() and voc.stat().st_mtime >= song.stat().st_mtime
    if not fresh:
        run(["demucs","--two-stems=vocals","-o",str(out),str(song)])
    return voc,nov

def gaps(voc, min_len=1.2, noise="-30dB"):
    r=subprocess.run(["ffmpeg","-v","info","-i",str(voc),"-af",
                      f"silencedetect=noise={noise}:d={min_len}","-f","null","-"],
                     capture_output=True,text=True)
    starts=[float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends=[float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(starts,ends))

def trim(src):
    dst=WORK/("trim_"+src.name)
    ff("-i",str(src),"-af","silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.05,"
       "areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.05,areverse,"
       "aresample=44100","-ac","2",str(dst))
    return dst,dur(dst)

# Per-door sample order: intro line first, emotional closer last (gets the haunt).
# Defaults to spz_* then kat_* (alphabetical) when a door isn't listed.
SAMPLE_ORDER = {
    5:  ["t5_spz_offcamera", "t5_kat_light", "t5_kat_allatonce"],
    6:  ["t6_spz_debt", "t6_kat_nameoutlives", "t6_kat_notyet"],
    14: ["t14_spz_product", "t14_kat_jacket", "t14_kat_doubted"],
}

CLEAN="highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=6:release=140,volume=2.0"
# gentle haunt — a mild pitch-down + light reverb (not the demonic asetrate=36000)
HAUNT=("aformat=sample_rates=44100,asetrate=41000,aresample=44100,aecho=0.6:0.5:55:0.3,volume=1.9")
INTRO_LEN=7.0; XF=0.5

def produce(n):
    song=vox_song(n); slug=song.stem.split("_",1)[1].rsplit("_VOX",1)[0]
    voc,nov=separate(song)
    G=gaps(voc)
    print(f"door {n} '{slug}': vocal-free pockets: "+", ".join(f"{a:.1f}-{b:.1f}" for a,b in G))
    # samples: SPZ line first (intro), then Kat lines (mid gaps, last one haunted)
    if n in SAMPLE_ORDER:
        order=[SAMP/f"{stem}.mp3" for stem in SAMPLE_ORDER[n]]
    else:
        order=sorted(SAMP.glob(f"t{n}_spz_*.mp3"))+sorted(SAMP.glob(f"t{n}_kat_*.mp3"))
    order=[p for p in order if p.exists()]
    if not order: sys.exit(f"no samples t{n}_* in {SAMP}")
    S=[trim(s) for s in order]

    D=dur(song)
    # Use the take's own vocal-free pockets. Spread the samples: intro -> first
    # pocket, haunt -> last pocket, middles -> spaced pockets in between.
    def eff(d, h): return d*(44100/41000)+1.6 if h else d
    usable=[(a,b) for (a,b) in G if b-a >= 1.8] or [(0.5, D)]
    plan=[]  # (path, dur, start, chain)
    ns=len(S)
    a0,b0=usable[0]; plan.append((S[0][0], S[0][1], a0+0.5, CLEAN))          # intro
    haunt_plan=None
    if ns>=2:
        hp,hd=S[-1]; hlen=eff(hd,True); oa,ob=usable[-1]
        hstart=max(oa+0.3, min((ob-hlen-0.3) if (ob-oa)>hlen else oa+0.3, D-hlen-2))
        haunt_plan=(hp,hd,hstart,HAUNT)
    mids=usable[1:-1] or usable[1:] or usable                                 # candidate middle pockets
    for k,(mp,md) in enumerate(S[1:-1] if ns>=3 else []):
        target=D*(k+1)/((ns-2)+1)                                             # even spread across the track
        cand=[g for g in mids if (g[1]-g[0])>=min(md,2.0)] or mids
        ga,gb=min(cand, key=lambda g:abs((g[0]+g[1])/2 - target))
        start=max(ga+0.3, min((ga+gb)/2 - md/2, gb-md-0.3))
        plan.append((mp,md,start,CLEAN))
    if haunt_plan: plan.append(haunt_plan)

    # build sample tracks, then duck the music under them (sidechain) so the
    # spoken word is clearly audible over the full-band instrumental
    inputs=["-i",str(song)]; parts=[]; samplabels=""
    for idx,(p,d,start,chain) in enumerate(plan,1):
        inputs+=["-i",str(p)]
        extra=f",afade=t=out:st={max(0,d-1.4):.2f}:d=1.6" if chain is HAUNT else ""
        parts.append(f"[{idx}:a]{chain}{extra},adelay={int(start*1000)}|{int(start*1000)}[a{idx}]")
        samplabels+=f"[a{idx}]"
    N=len(plan)
    parts.append(f"{samplabels}amix=inputs={N}:duration=longest:normalize=0[smix]")
    parts.append("[smix]asplit=2[sctrig][sfg]")
    parts.append("[0:a][sctrig]sidechaincompress=threshold=0.03:ratio=12:attack=8:release=320:makeup=1[duck]")
    parts.append("[duck][sfg]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-10:TP=-1.0:LRA=11,alimiter=limit=0.97[out]")
    fc=";".join(parts)
    out=PROD/f"ep{n:02d}_song_FINAL.mp3"
    ff(*inputs,"-filter_complex",fc,"-map","[out]","-ar","44100","-b:a","192k",str(out))
    fn=f"track{n:02d}_{slug}_FINAL.mp3"
    (DL/fn).write_bytes(out.read_bytes())
    (REVIEW/fn).write_bytes(out.read_bytes())
    print("  placements: "+", ".join(f"{order[i].stem}@{s:.1f}s{' [haunt]' if c is HAUNT else ''}"
                                      for i,(_,_,s,c) in enumerate(plan)))
    print(f"  -> {out.name} ({out.stat().st_size//1024} KB, {dur(out):.0f}s)")

def pro_song(n):
    hits=sorted(SONGS.glob(f"track{n:02d}_*_PRO.mp3"))
    if not hits: sys.exit(f"no PRO instrumental for door {n} (run compose_songs.py {n} --instrumental)")
    return hits[0]

def produce_pro(n):
    """Instrumental track (no AI singing) + spoken samples spaced over the beat.
    Matches the locked tracks 1-4: clean instrumental, no garbled vocals."""
    song=pro_song(n); slug=song.stem.split("_",1)[1].rsplit("_PRO",1)[0]
    D=dur(song)
    if n in SAMPLE_ORDER:
        order=[SAMP/f"{s}.mp3" for s in SAMPLE_ORDER[n]]
    else:
        order=sorted(SAMP.glob(f"t{n}_spz_*.mp3"))+sorted(SAMP.glob(f"t{n}_kat_*.mp3"))
    order=[p for p in order if p.exists()]
    if not order: sys.exit(f"no samples t{n}_* in {SAMP}")
    S=[trim(s) for s in order]
    # no singing to dodge — space the samples evenly over the instrumental
    slots=[2.5, D*0.46]
    plan=[]  # (path, dur, start, chain)
    for i,(p,d) in enumerate(S):
        haunt=(i==len(S)-1)
        if haunt:
            hlen=d*(44100/36000)+1.6
            start=max((slots[1] if len(S)>1 else 2.5)+8, D-hlen-3)
        else:
            start=slots[i] if i<len(slots) else (plan[-1][2]+plan[-1][1]+3)
        plan.append((p,d,start,HAUNT if haunt else CLEAN))
    inputs=["-i",str(song)]; parts=[]; samplabels=""
    for idx,(p,d,start,chain) in enumerate(plan,1):
        inputs+=["-i",str(p)]
        extra=f",afade=t=out:st={max(0,d-1.4):.2f}:d=1.6" if chain is HAUNT else ""
        parts.append(f"[{idx}:a]{chain}{extra},adelay={int(start*1000)}|{int(start*1000)}[a{idx}]")
        samplabels+=f"[a{idx}]"
    # Duck the music under the spoken samples so they're clearly audible (they'd
    # otherwise be masked by the full-band instrumental). Sidechain the music by
    # the summed sample track, then mix the samples back on top.
    N=len(plan)
    parts.append(f"{samplabels}amix=inputs={N}:duration=longest:normalize=0[smix]")
    parts.append("[smix]asplit=2[sctrig][sfg]")
    parts.append("[0:a][sctrig]sidechaincompress=threshold=0.03:ratio=12:attack=8:release=320:makeup=1[duck]")
    parts.append("[duck][sfg]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-10:TP=-1.0:LRA=11,alimiter=limit=0.97[out]")
    fc=";".join(parts)
    out=PROD/f"ep{n:02d}_song_FINAL.mp3"
    ff(*inputs,"-filter_complex",fc,"-map","[out]","-ar","44100","-b:a","192k",str(out))
    fn=f"track{n:02d}_{slug}_FINAL.mp3"
    (DL/fn).write_bytes(out.read_bytes())
    (REVIEW/fn).write_bytes(out.read_bytes())
    print("  placements: "+", ".join(f"{order[i].stem}@{s:.1f}s{' [haunt]' if c is HAUNT else ''}"
                                      for i,(_,_,s,c) in enumerate(plan)))
    print(f"  -> {out.name} ({out.stat().st_size//1024} KB, {dur(out):.0f}s) + ~/Downloads")

if __name__=="__main__":
    args=sys.argv[1:]
    pro = "--pro" in args
    if pro: args.remove("--pro")
    if not args: sys.exit(__doc__)
    for a in args:
        (produce_pro if pro else produce)(int(a))
