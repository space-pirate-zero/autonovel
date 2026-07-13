#!/usr/bin/env python3
"""
gen_teasers.py — animated per-episode teaser videos for Reels / Shorts / TikTok.

For each chapter: its anime episode art (slow Ken-Burns push) over the SPZ void,
with the EP number, the chapter title, a one-line hook, and NOW STREAMING /
lasthumanceo.com animating in with a neon glow-pulse — under ~11s of that
chapter's own audio. Vertical 1080x1920.

ffmpeg here lacks drawtext, so the animated text is a Pillow RGBA frame sequence
composited over an ffmpeg zoompan background + waveform.

Outputs social/video/teasers/teaser_epNN.mp4 (resumable — skips existing).
Run:   uv run --with pillow python3 social/gen_teasers.py         # all 29
       uv run --with pillow python3 social/gen_teasers.py 1 8 13   # just those
       FORCE=1 uv run --with pillow python3 social/gen_teasers.py 1
"""
import subprocess, tempfile, math, json, sys, os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "social" / "video" / "teasers"; OUT.mkdir(parents=True, exist_ok=True)
F = BASE.parent.parent / "fonts"
ART = BASE / "art" / "episodes"
CHAP = BASE / "chapters"
PROD = BASE / "audiobook" / "produced"
HOOKS = json.load(open(BASE / "social" / "hooks.json"))
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (138, 144, 160)
W, H = 1080, 1920
ART_SZ = 1080                       # art panel: full-width square at the top
FPS = 30; DUR = 11.0
BAND_Y = 1100                       # text overlay band starts here
BAND_H = H - BAND_Y                 # 820


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def ff(*a): subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)
def ease(p): return 1 - (1 - max(0.0, min(1.0, p))) ** 3
def fit(d, t, n, s, mw):
    while s > 14 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)


def wrap(d, text, font, mw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= mw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines


def title_of(n):
    p = (CHAP / "ch_coda.md") if n == 29 else (CHAP / f"ch_{n:02d}.md")
    head = p.read_text().splitlines()[0].lstrip("# ").strip()
    return head.split("—", 1)[1].strip() if "—" in head else head


def glow(base, text, font, rgb, x, y, alpha, g=0.0):
    if alpha <= 0: return
    bb = font.getbbox(text); tw = bb[2] - bb[0]; th = bb[3] - bb[1]; pad = 28
    tile = Image.new("RGBA", (int(tw) + 2*pad, int(th) + 2*pad), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    if g > 0:
        halo = Image.new("RGBA", tile.size, (0, 0, 0, 0))
        ImageDraw.Draw(halo).text((pad - bb[0], pad - bb[1]), text, font=font, fill=rgb + (int(255 * g),))
        tile.alpha_composite(halo.filter(ImageFilter.GaussianBlur(11)))
    td.text((pad - bb[0], pad - bb[1]), text, font=font, fill=rgb + (int(255 * alpha),))
    base.alpha_composite(tile, (int(x - pad), int(y - pad)))


def cx(d, text, font): return (W - d.textlength(text, font=font)) / 2


def furniture(n):
    """Static layer: void glow bg + top/bottom scrims + EP kicker over the art."""
    img = Image.new("RGBA", (W, H), VOID + (255,))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.ellipse((-W*0.25, -H*0.05, W*0.55, H*0.22), fill=(255, 20, 147, 46))
    d.ellipse((W*0.55, H*0.72, W*1.35, H*1.15), fill=(0, 240, 255, 30))
    img = Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(70)))
    # scrim under the art so it melts into the void where the text sits
    scrim = Image.new("RGBA", (W, ART_SZ), (0, 0, 0, 0)); sd = ImageDraw.Draw(scrim)
    for i in range(300):
        yy = ART_SZ - 300 + i
        sd.line((0, yy, W, yy), fill=(3, 3, 3, int(255 * (i / 300))))
    top = Image.new("RGBA", (W, 220), (0, 0, 0, 0)); tdd = ImageDraw.Draw(top)
    for i in range(220):
        tdd.line((0, i, W, i), fill=(3, 3, 3, int(150 * (1 - i / 220))))
    return img, scrim, top


def furniture_png(n):
    """Compose the static furniture PNG minus the (moving) art; art overlaid by ffmpeg."""
    base, scrim, top = furniture(n)
    # kicker rendered onto a transparent top layer that rides above the art
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(over)
    over.alpha_composite(top, (0, 0))
    over.alpha_composite(scrim, (0, 0))
    kf = fnt("JetBrainsMono-700.ttf", 30); sf = fnt("JetBrainsMono-400.ttf", 24)
    kick = f"EP {n:02d}"
    d.text((60, 54), kick, font=kf, fill=CYAN + (255,))
    d.text((60 + d.textlength(kick, font=kf) + 20, 58), "· A SPACE PIRATE ZERO TRANSMISSION",
           font=sf, fill=MUTED + (255,))
    bgp = tempfile.mktemp(suffix=".png"); base.convert("RGB").save(bgp)
    ovp = tempfile.mktemp(suffix=".png"); over.save(ovp)
    return bgp, ovp


def text_frames(n, tmp):
    """Animated bottom band (1080xBAND_H): title, hook, NOW STREAMING, link."""
    d = Path(tmp) / "tx"; d.mkdir()
    scratch = ImageDraw.Draw(Image.new("RGB", (W, H)))
    title = title_of(n).upper()
    tf = fit(scratch, title, "Orbitron-900.ttf", 74, W - 130)
    tlines = wrap(scratch, title, tf, W - 130)
    hook = HOOKS.get(str(n), "")
    hf = fnt("SpaceGrotesk-400.ttf", 38)
    hlines = wrap(scratch, hook, hf, W - 150)
    nsf = fnt("Orbitron-700.ttf", 38); lkf = fnt("JetBrainsMono-700.ttf", 34)

    # y positions inside the band (absolute frame y)
    ty0 = 1180
    th = (tf.getbbox("Ay")[3] - tf.getbbox("Ay")[1])
    hy0 = ty0 + len(tlines) * (th + 14) + 40
    hh = (hf.getbbox("Ay")[3] - hf.getbbox("Ay")[1])
    ns_y = hy0 + len(hlines) * (hh + 10) + 70
    lk_y = ns_y + 74

    n_fr = int(DUR * FPS)
    for i in range(n_fr):
        t = i / FPS
        fr = Image.new("RGBA", (W, BAND_H), (0, 0, 0, 0))
        off = BAND_Y
        # title lines
        a = ease((t - 0.4) / 0.55); sl = int((1 - a) * 22)
        if a > 0:
            for li, ln in enumerate(tlines):
                x = cx(scratch, ln, tf)
                glow(fr, ln, tf, PAPER, x, ty0 - off + li * (th + 14) + sl, a, 0.0)
        # hook lines
        a = ease((t - 0.9) / 0.55); sl = int((1 - a) * 22)
        if a > 0:
            for li, ln in enumerate(hlines):
                x = cx(scratch, ln, hf)
                glow(fr, ln, hf, CYAN, x, hy0 - off + li * (hh + 10) + sl, a, 0.0)
        # NOW STREAMING (glow-pulse)
        a = ease((t - 1.6) / 0.5); sl = int((1 - a) * 20)
        pg = 0.30 + 0.30 * (0.5 + 0.5 * math.sin((t - 2.1) * 2.4)) if t > 2.1 else 0.0
        glow(fr, "NOW STREAMING", nsf, PINK, cx(scratch, "NOW STREAMING", nsf), ns_y - off + sl, a, pg * a)
        # link (glow-pulse)
        a = ease((t - 2.0) / 0.5); sl = int((1 - a) * 20)
        pg = 0.28 + 0.32 * (0.5 + 0.5 * math.sin((t - 2.5) * 2.4)) if t > 2.5 else 0.0
        glow(fr, "lasthumanceo.com", lkf, PINK, cx(scratch, "lasthumanceo.com", lkf), lk_y - off + sl, a, pg * a)
        fr.save(d / f"f_{i:04d}.png")
    return d, n_fr


def audio(n, tmp):
    src = PROD / (f"ch_coda_PRODUCED.mp3" if n == 29 else f"ch_{n:02d}_PRODUCED.mp3")
    if not src.exists():
        src = PROD / f"ch_{n:02d}_PRODUCED.mp3"
    p = Path(tmp) / "a.m4a"
    ff("-ss", "0", "-t", str(DUR), "-i", str(src), "-vn", "-map", "0:a",
       "-af", f"afade=t=in:st=0:d=0.4,afade=t=out:st={DUR-1.6}:d=1.6,loudnorm=I=-14:TP=-1.5",
       "-c:a", "aac", "-b:a", "192k", str(p))
    return p


def render(n):
    out = OUT / f"teaser_ep{n:02d}.mp4"
    if out.exists() and not os.environ.get("FORCE"):
        print(f"  ep{n:02d}: exists, skip"); return
    art = ART / f"ep{n:02d}.jpg"
    if not art.exists():
        print(f"  ep{n:02d}: no art, skip"); return
    tmp = tempfile.mkdtemp(prefix=f"tz{n:02d}_")
    bgp, ovp = furniture_png(n)
    txd, nfr = text_frames(n, tmp)
    au = audio(n, tmp)
    zf = int(DUR * FPS)
    inputs = ["-loop", "1", "-t", str(DUR), "-i", str(art),        # 0 art (ken burns)
              "-i", str(bgp),                                      # 1 void bg
              "-i", str(ovp),                                      # 2 scrim+kicker
              "-framerate", str(FPS), "-i", f"{txd}/f_%04d.png",   # 3 animated text band
              "-i", str(au)]                                       # 4 audio
    fc = (f"[0:v]scale=1360:1360,zoompan=z='min(pzoom+0.00055,1.14)':d=1:"
          f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={ART_SZ}x{ART_SZ}:fps={FPS}[art];"
          f"[1:v][art]overlay=0:0[a1];"
          f"[a1][2:v]overlay=0:0[a2];"
          f"[4:a]showwaves=s={W}x70:mode=cline:rate={FPS}:colors=0x00F0FF|0xFF1493:draw=full[wave];"
          f"[a2][wave]overlay=0:{H-96}:shortest=1[a3];"
          f"[a3][3:v]overlay=0:{BAND_Y}:shortest=1,format=yuv420p[vout]")
    ff(*inputs, "-filter_complex", fc, "-map", "[vout]", "-map", "4:a",
       "-t", str(DUR), "-r", str(FPS), "-c:v", "libx264", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out))
    print(f"  -> {out.name}")


def main():
    eps = [int(x) for x in sys.argv[1:]] or list(range(1, 30))
    print(f"teasers: {len(eps)} episode(s)")
    for n in eps:
        render(n)
    print("done.")


if __name__ == "__main__":
    main()
