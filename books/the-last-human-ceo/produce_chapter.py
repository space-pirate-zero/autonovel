#!/usr/bin/env python3
"""
produce_chapter.py — wrap a rendered chapter with the theme + final touches into
a polished, loudness-matched deliverable.

Layout (chapter 1):
  [opening]           SPZ title card ducked over the theme; after the VO the theme
                      resolves for a few seconds (no dead silence) ...
   ~crossfade~        ... and dissolves into ...
  [ch_NN.mp3]         the narration (normalized to -16 LUFS)
   ~crossfade~        ... which swells into ...
  [theme reprise]     ~22s tail of theme.mp3 (end-of-chapter music)

The transitions are equal-power CROSSFADES (no hard cuts, no silent gaps), so the
voice emerges out of the music and the music swells back in at the end. Everything
is conformed to stereo/44.1k/192k and loudness-matched.

Usage (from the book dir):
  uv run --with python-dotenv python produce_chapter.py 1        # produce chapter 1 (with intro)
  uv run --with python-dotenv python produce_chapter.py 1 --no-intro
  uv run --with python-dotenv python produce_chapter.py 3 8      # range
"""
import subprocess, sys, re
from pathlib import Path

BASE = Path(__file__).parent
AUDIO = BASE / "audiobook"
CH = AUDIO / "chapters"
INTRO = AUDIO / "00_intro.mp3"     # standalone book-front intro (its own clean fade)
TITLE_VO = AUDIO / "intro_vo.mp3"  # ch-1 title-card stem (the book-level cold open)
INTROS = AUDIO / "intros"          # per-chapter SPZ host-intro VOs: chNN_vo.mp3
THEME = AUDIO / "theme.mp3"
OUT = AUDIO / "produced"


def intro_vo_for(n):
    """The SPZ intro voiceover for chapter n: ch 1 = the book title card;
    every other chapter = its generated host-intro (recap + teaser). None if missing."""
    if n == 1 and TITLE_VO.exists():
        return TITLE_VO
    p = INTROS / f"ch{n:02d}_vo.mp3"
    return p if p.exists() else None
OUT.mkdir(parents=True, exist_ok=True)
WORK = OUT / ".work"
WORK.mkdir(parents=True, exist_ok=True)


def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except: return 0.0


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)


def conform(src, out, I=-16.0):
    """Normalize loudness + force stereo/44.1k/192k."""
    ff("-i", str(src), "-af", f"loudnorm=I={I}:TP=-1.5:LRA=11",
       "-ar", "44100", "-ac", "2", "-b:a", "192k", str(out))


def silence(secs, out):
    ff("-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
       "-t", f"{secs:.2f}", "-ar", "44100", "-ac", "2", "-b:a", "192k", str(out))


def theme_outro(out, secs=22.0, fin=0.3, fout=7.0, I=-14.0):
    # short fade-in — the crossfade from the chapter supplies the swell
    d = probe(THEME)
    st = max(0.0, d - secs)
    ff("-ss", f"{st:.2f}", "-i", str(THEME), "-af",
       f"afade=t=in:st=0:d={fin},afade=t=out:st={max(0.1, secs - fout):.2f}:d={fout},"
       f"loudnorm=I={I}:TP=-1.5:LRA=11",
       "-ar", "44100", "-ac", "2", "-b:a", "192k", str(out))


def crossfade(a, b, out, d=2.5):
    """Equal-power crossfade a -> b (overlap d secs). No gap, no hard cut."""
    ff("-i", str(a), "-i", str(b), "-filter_complex",
       f"[0][1]acrossfade=d={d}:c1=tri:c2=tri",
       "-ar", "44100", "-ac", "2", "-b:a", "192k", str(out))


def intro_over_chapter(chapter_norm, out, vo_path, n, lead_in=2.6, vo_gap=0.9,
                       bed_start=46.0):
    """One continuous, ducked music bed spans the SPZ intro VO AND the first ~13s of
    the chapter, then fades out — so the narration emerges from the theme with no
    seam. Bed length + fade are computed from the VO length so any intro fits. The
    bed is drawn from a MUSICAL passage of the theme (not the sparse title-bed)."""
    vo_len = probe(vo_path)
    chap_start = lead_in + vo_len + vo_gap          # abs time the narration begins
    bed_len = chap_start + 14.0                      # bed carries ~14s into the chapter
    fade_st = chap_start + 4.0                       # start fading 4s after voice begins
    fade_d = 9.0
    bed = WORK / f"intro_bed_{n}.mp3"
    ff("-ss", f"{bed_start:.2f}", "-i", str(THEME), "-t", f"{bed_len:.2f}",
       "-ar", "44100", "-ac", "2", "-b:a", "192k", str(bed))
    dvo = int(lead_in * 1000)
    dch = int(chap_start * 1000)
    fc = (
        f"[1:a]adelay={dvo}|{dvo},highpass=f=95,"
        "acompressor=threshold=-20dB:ratio=3:attack=6:release=140,volume=1.9[vo];"
        f"[2:a]adelay={dch}|{dch}[chap];"
        "[vo][chap]amix=inputs=2:duration=longest:normalize=0[voice];"
        "[voice]asplit=2[voice_out][voice_sc];"
        "[0:a][voice_sc]sidechaincompress=threshold=0.04:ratio=12:attack=8:release=320:makeup=1[bd];"
        f"[bd]afade=t=in:st=0:d=0.4,afade=t=out:st={fade_st:.2f}:d={fade_d:.2f}[bed_f];"
        "[bed_f][voice_out]amix=inputs=2:duration=longest:normalize=0,"
        "loudnorm=I=-16:TP=-1.5:LRA=11[out]"
    )
    ff("-i", str(bed), "-i", str(vo_path), "-i", str(chapter_norm),
       "-filter_complex", fc, "-map", "[out]",
       "-ar", "44100", "-ac", "2", "-b:a", "192k", str(out))


def produce(n, with_intro=True):
    ch = CH / f"ch_{n:02d}.mp3"
    if not ch.exists():
        print(f"  Ch {n}: {ch.name} not rendered yet — skipping")
        return None

    # normalized chapter voice
    seg = WORK / f"ch_{n:02d}_norm.mp3"; conform(ch, seg, I=-16.0)

    # opening: the chapter's SPZ host-intro over a continuous ducked theme bed that
    # carries into the chapter's first ~13s, then fades — no seam.
    tag = "  [no-intro-vo]"
    if with_intro:
        vo = intro_vo_for(n)
        if vo is not None:
            seg2 = WORK / f"intro_ch_{n}.mp3"; intro_over_chapter(seg, seg2, vo, n)
            seg = seg2
            tag = "  [+intro:title]" if (n == 1) else "  [+intro:recap]"

    # crossfade the chapter INTO the theme outro (music swells as narration ends).
    # Parts are already -16 LUFS, so the crossfade result IS the final — no extra pass.
    outro = WORK / f"outro_{n}.mp3"; theme_outro(outro)
    out = OUT / f"ch_{n:02d}_PRODUCED.mp3"
    crossfade(seg, outro, out, d=2.2)
    print(f"  -> {out.name}  ({probe(out)/60:.1f} min, {out.stat().st_size/1e6:.1f} MB){tag}")
    return out


def rendered_chapters():
    """Slots with a rendered ch_NN.mp3, excluding 0 (front matter — its transmission
    IS the musical intro, so it is not produced as a standalone chapter)."""
    out = []
    for f in sorted(CH.glob("ch_*.mp3")):
        m = f.stem.replace("ch_", "")
        if m.isdigit() and int(m) >= 1:
            out.append(int(m))
    return out


def assemble_book():
    """Stitch every produced chapter in order into one tagged audiobook file.
    ch_01 leads (it carries the book title card); the coda (slot 29) tails."""
    files = sorted(OUT.glob("ch_*_PRODUCED.mp3"),
                   key=lambda p: int(re.search(r'ch_(\d+)_', p.name).group(1)))
    if not files:
        sys.exit("no produced chapters to assemble")
    listing = WORK / "book_list.txt"
    listing.write_text("".join(f"file '{p}'\n" for p in files))
    out = AUDIO / "The_Last_Human_CEO_AUDIOBOOK.mp3"
    ff("-f", "concat", "-safe", "0", "-i", str(listing),
       "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", "-ac", "2",
       "-metadata", "title=The Last Human CEO", "-metadata", "artist=Space Pirate Zero",
       "-metadata", "album=The Last Human CEO", str(out))
    print(f"  -> {out.name}  ({len(files)} chapters, {probe(out)/3600:.2f} h, {out.stat().st_size/1e6:.0f} MB)")


def main():
    args = [a for a in sys.argv[1:]]
    if "--assemble" in args:
        assemble_book(); return
    no_intro = "--no-intro" in args
    force = "--force" in args
    if "all" in args:
        nums = rendered_chapters()
    else:
        digits = [int(a) for a in args if a.isdigit()]
        if not digits:
            sys.exit("usage: produce_chapter.py <N [M] | all> [--no-intro] [--force]")
        nums = list(range(digits[0], (digits[1] if len(digits) > 1 else digits[0]) + 1))

    for n in nums:
        out = OUT / f"ch_{n:02d}_PRODUCED.mp3"
        if out.exists() and not force:
            print(f"  Ch {n}: produced already ({out.stat().st_size/1e6:.1f}MB), skipping (--force to redo)")
            continue
        # every chapter gets a spoken intro (ch 1 = title card; others = host-intro)
        produce(n, with_intro=(not no_intro))


if __name__ == "__main__":
    main()
