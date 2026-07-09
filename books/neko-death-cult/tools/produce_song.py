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
    if not (voc.exists() and nov.exists()):
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
    14: ["t14_spz_product", "t14_kat_jacket", "t14_kat_doubted"],
}

CLEAN="highpass=f=100,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=120,volume=1.7"
HAUNT=("aformat=sample_rates=44100,asetrate=36000,aresample=44100,aecho=0.8:0.7:70:0.4,volume=2.1")
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

    # clean intro pocket from no_vocals, prepend seamlessly
    ff("-ss","0","-t",str(INTRO_LEN),"-i",str(nov),
       "-af","afade=t=in:st=0:d=0.05,aformat=sample_rates=44100:channel_layouts=stereo",str(WORK/"introbed.wav"))
    ff("-i",str(WORK/"introbed.wav"),"-i",str(song),
       "-filter_complex",f"[0:a][1:a]acrossfade=d={XF}:c1=tri:c2=tri[b]","-map","[b]",str(WORK/"base.wav"))
    OFF=INTRO_LEN-XF
    # placement plan: sample 0 -> intro; rest -> detected gaps (shifted by OFF), last haunted
    mid_gaps=[(a+OFF,b+OFF) for a,b in G]
    plan=[]  # (path, dur, start, chain)
    p0,d0=S[0]; plan.append((p0,d0,1.1,CLEAN))
    gi=0
    for i,(p,d) in enumerate(S[1:],1):
        haunt=(i==len(S)-1)
        if gi<len(mid_gaps):
            gs,ge=mid_gaps[gi]; gi+=1; pocket=max(2.0,ge-gs-0.2); start=gs+0.1
        else:
            start=max(p for _,_,p,_ in plan)+d+1.0; pocket=d
        chain=HAUNT if haunt else CLEAN
        if not haunt and d>pocket:
            chain=chain.replace("volume=1.7",f"atempo={d/pocket:.3f},volume=1.7")
        plan.append((p,d,start,chain))

    # build filter graph
    inputs=["-i",str(WORK/"base.wav")]; parts=[]; mixlabels="[0:a]"
    for idx,(p,d,start,chain) in enumerate(plan,1):
        inputs+=["-i",str(p)]
        extra=f",afade=t=out:st={max(0,d-1.4):.2f}:d=1.6" if chain is HAUNT else ""
        parts.append(f"[{idx}:a]{chain}{extra},adelay={int(start*1000)}|{int(start*1000)}[a{idx}]")
        mixlabels+=f"[a{idx}]"
    fc=";".join(parts)+f";{mixlabels}amix=inputs={len(plan)+1}:duration=first:normalize=0,loudnorm=I=-10:TP=-1.0:LRA=11,alimiter=limit=0.95[out]"
    out=PROD/f"ep{n:02d}_song_FINAL.mp3"
    ff(*inputs,"-filter_complex",fc,"-map","[out]","-ar","44100","-b:a","192k",str(out))
    (DL/f"track{n:02d}_{slug}_FINAL.mp3").write_bytes(out.read_bytes())
    print("  placements: "+", ".join(f"{order[i].stem}@{s:.1f}s{' [haunt]' if c is HAUNT else ''}"
                                      for i,(_,_,s,c) in enumerate(plan)))
    print(f"  -> {out.name} ({out.stat().st_size//1024} KB, {dur(out):.0f}s) + ~/Downloads")

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
    inputs=["-i",str(song)]; parts=[]; mixlabels="[0:a]"
    for idx,(p,d,start,chain) in enumerate(plan,1):
        inputs+=["-i",str(p)]
        extra=f",afade=t=out:st={max(0,d-1.4):.2f}:d=1.6" if chain is HAUNT else ""
        parts.append(f"[{idx}:a]{chain}{extra},adelay={int(start*1000)}|{int(start*1000)}[a{idx}]")
        mixlabels+=f"[a{idx}]"
    # sum + loudness-normalize (true-peak-safe) + limit
    fc=";".join(parts)+f";{mixlabels}amix=inputs={len(plan)+1}:duration=first:normalize=0,loudnorm=I=-10:TP=-1.0:LRA=11,alimiter=limit=0.97[out]"
    out=PROD/f"ep{n:02d}_song_FINAL.mp3"
    ff(*inputs,"-filter_complex",fc,"-map","[out]","-ar","44100","-b:a","192k",str(out))
    (DL/f"track{n:02d}_{slug}_FINAL.mp3").write_bytes(out.read_bytes())
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
