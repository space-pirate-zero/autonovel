#!/usr/bin/env python3
"""
gen_trailer.py — ~50s launch trailer with MOTION GRAPHICS.
Crossfading montage of anime episode art + SPZ's Chapter-1 voice + a reactive
waveform, a title lower-third that animates in over the montage, and an animated
end card where NOW STREAMING / the title / lasthumanceo.com fade-and-slide in.

ffmpeg here has no drawtext, so animated text is rendered as Pillow frame
sequences / transparent PNGs and composited.

Output social/video/trailer.mp4 (1080x1080).
Run:  uv run --with pillow python3 social/gen_trailer.py
"""
import subprocess, tempfile, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "social" / "video"; OUT.mkdir(parents=True, exist_ok=True)
F = BASE.parent.parent / "fonts"
EPART = BASE / "art" / "episodes"
COVER = BASE / "art" / "podcast_cover_src.png"
HOOK_SRC = BASE / "audiobook" / "produced" / "ch_01_PRODUCED.mp3"
TMP = Path(tempfile.mkdtemp(prefix="tlhc_tr_"))
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (138, 144, 160)

MONTAGE = [1, 8, 9, 13, 16, 20, 24, 28]
L = 6.5; T = 1.2; SZ = 1080; FPS = 30


def ff(*a): subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)
def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 10 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)
def ease(p): return 1 - (1 - max(0.0, min(1.0, p))) ** 3


def glowbg(w, h):
    img = Image.new("RGBA", (w, h), VOID + (255,))
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.ellipse((-w*0.2, -h*0.2, w*0.5, h*0.3), fill=(255, 20, 147, 46))
    d.ellipse((w*0.6, h*0.6, w*1.3, h*1.25), fill=(0, 240, 255, 30))
    return Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(60)))


def atext(frame, text, font, rgb, t, t0, t1, y, slide=26):
    """Composite centered text onto RGBA frame with fade+slide-up between t0..t1."""
    if t < t0:
        return frame
    e = ease((t - t0) / (t1 - t0))
    layer = Image.new("RGBA", frame.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    tw = d.textlength(text, font=font)
    d.text(((frame.width - tw) / 2, y + int((1 - e) * slide)), text, font=font,
           fill=rgb + (int(255 * e),))
    return Image.alpha_composite(frame, layer)


def gtext(frame, text, font, rgb, y, alpha, glow=0.0, x=None):
    """Centered text with a cheap blurred neon halo (for pulse)."""
    if alpha <= 0: return frame
    W = frame.width
    sd = ImageDraw.Draw(frame); tw = sd.textlength(text, font=font)
    bb = font.getbbox(text); th = bb[3] - bb[1]; pad = 30
    px = (W - tw) / 2 if x is None else x
    tile = Image.new("RGBA", (int(tw) + 2*pad, int(th) + 2*pad), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    if glow > 0:
        halo = Image.new("RGBA", tile.size, (0, 0, 0, 0))
        ImageDraw.Draw(halo).text((pad, pad - bb[1]), text, font=font, fill=rgb + (int(255 * glow),))
        tile.alpha_composite(halo.filter(ImageFilter.GaussianBlur(12)))
    td.text((pad, pad - bb[1]), text, font=font, fill=rgb + (int(255 * alpha),))
    frame.alpha_composite(tile, (int(px - pad), int(y - pad)))
    return frame


def intro_title_frames(dur=2.6):
    """Big title flies in (fade+slide+scale), holds, then fades out — overlaid on scene 1."""
    d = TMP / "intro"; d.mkdir()
    tmp = Image.new("RGB", (SZ, SZ)); md = ImageDraw.Draw(tmp)
    tf = fit(md, "THE LAST HUMAN CEO", "Orbitron-900.ttf", 78, SZ - 120)
    kf = fnt("JetBrainsMono-400.ttf", 26)
    n = int(dur * FPS)
    for i in range(n):
        t = i / FPS
        fr = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0))
        ein = ease(t / 0.7)                       # fly-in 0..0.7s
        out = ease((t - (dur - 0.5)) / 0.5)       # fade-out last 0.5s
        vis = ein * (1 - out)
        if vis > 0:
            # subtle scale via letterspacing-free slide; kicker under title
            sl = int((1 - ein) * 60)
            gp = 0.25 + 0.30 * (0.5 + 0.5 * math.sin((t - 0.7) * 3.0)) if t > 0.7 else 0.0
            gtext(fr, "THE LAST HUMAN CEO", tf, PINK, 470 + sl, vis, gp * vis)
            ka = ease((t - 0.5) / 0.5) * (1 - out)
            gtext(fr, "a full-cast audiobook", kf, CYAN, 560 + sl, ka, 0.0)
        fr.save(d / f"f_{i:04d}.png")
    return d, n, dur


def endcard_frames(dur):
    """Render the animated end card as an RGB frame sequence -> returns (dir, n)."""
    d = TMP / "ec"; d.mkdir()
    base = glowbg(SZ, SZ)
    cover = Image.open(COVER).convert("RGBA").resize((470, 470))
    tmp = Image.new("RGB", (SZ, SZ)); md = ImageDraw.Draw(tmp)
    tf = fit(md, "THE LAST HUMAN CEO", "Orbitron-900.ttf", 60, SZ - 100)
    n = int(dur * FPS)
    for i in range(n):
        t = i / FPS
        fr = base.copy()
        ce = ease((t - 0.0) / 0.6)                       # cover fade+scale
        if ce > 0:
            s = int(470 * (0.94 + 0.06 * ce))
            cov = cover.resize((s, s))
            a = cov.split()[3].point(lambda x: int(x * ce)); cov.putalpha(a)
            fr.alpha_composite(cov, ((SZ - s) // 2, 120 + int((1 - ce) * 12)))
        # NOW STREAMING: fade+slide in, then glow-pulse
        nse = ease((t - 0.5) / 0.6)
        if nse > 0:
            npg = 0.28 + 0.30 * (0.5 + 0.5 * math.sin((t - 1.1) * 2.6)) if t > 1.1 else 0.0
            fr = gtext(fr, "NOW STREAMING", fnt("Orbitron-700.ttf", 44), PINK,
                       640 + int((1 - nse) * 26), nse, npg * nse)
        fr = atext(fr, "THE LAST HUMAN CEO", tf, PAPER, t, 0.9, 1.5, 706)
        fr = atext(fr, "A full-cast audiobook · 29 chapters", fnt("SpaceGrotesk-500.ttf", 27), MUTED, t, 1.3, 1.8, 786)
        fr = atext(fr, "> Apple Podcasts · Spotify", fnt("JetBrainsMono-400.ttf", 26), CYAN, t, 1.6, 2.1, 870)
        # link fades in, then gently glow-pulses
        le = ease((t - 1.9) / 0.5)
        if le > 0:
            lpg = 0.30 + 0.35 * (0.5 + 0.5 * math.sin((t - 2.4) * 3.0)) if t > 2.4 else 0.0
            fr = gtext(fr, "lasthumanceo.com", fnt("JetBrainsMono-400.ttf", 32), PINK,
                       918 + int((1 - le) * 26), le, lpg * le)
        fr.convert("RGB").save(d / f"f_{i:04d}.png")
    return d, n


def title_lowerthird():
    """Transparent PNG: small title lower-third, faded in/out via ffmpeg during montage."""
    img = Image.new("RGBA", (SZ, 120), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.text((60, 20), "THE LAST HUMAN CEO", font=fnt("Orbitron-700.ttf", 34), fill=PINK + (255,))
    d.text((62, 68), "a full-cast audiobook · lasthumanceo.com", font=fnt("JetBrainsMono-400.ttf", 22), fill=CYAN + (255,))
    p = TMP / "lt.png"; img.save(p); return p


def main():
    ecdir, ecn = endcard_frames(L)
    introdir, intron, intro_dur = intro_title_frames(2.6)
    lt = title_lowerthird()
    lt_in = intro_dur + 0.2
    arts = [EPART / f"ep{n:02d}.jpg" for n in MONTAGE]
    N = len(arts) + 1                          # + animated end card
    total = N * L - (N - 1) * T
    m_end = (N - 1) * L - (N - 1) * T          # montage end (before endcard fully in) ~ where end card starts

    hook = TMP / "hook.m4a"
    ff("-ss", "0", "-t", f"{total:.2f}", "-i", str(HOOK_SRC), "-vn", "-map", "0:a",
       "-af", f"afade=t=in:st=0:d=1,afade=t=out:st={total-2:.2f}:d=2,loudnorm=I=-14:TP=-1.5",
       "-c:a", "aac", "-b:a", "192k", str(hook))

    inputs = []
    for p in arts:
        inputs += ["-loop", "1", "-t", f"{L}", "-i", str(p)]
    inputs += ["-framerate", str(FPS), "-i", f"{ecdir}/f_%04d.png"]     # input index N-1
    inputs += ["-i", str(lt)]                                           # index N
    inputs += ["-i", str(hook)]                                        # index N+1
    inputs += ["-framerate", str(FPS), "-i", f"{introdir}/f_%04d.png"]  # index N+2 (intro title)

    fc = "".join(f"[{i}:v]scale={SZ}:{SZ}:force_original_aspect_ratio=increase,crop={SZ}:{SZ},setsar=1,fps={FPS},format=yuv420p[v{i}];"
                 for i in range(N))
    prev = "[v0]"
    for m in range(1, N):
        off = m * (L - T); lbl = f"x{m}"
        fc += f"{prev}[v{m}]xfade=transition=fade:duration={T}:offset={off:.2f}[{lbl}];"
        prev = f"[{lbl}]"
    # animated title lower-third: fade in after the intro reveal, out before the end card
    fc += (f"[{N}:v]format=rgba,fade=t=in:st={lt_in:.2f}:d=0.6:alpha=1,fade=t=out:st={m_end-0.6:.2f}:d=0.6:alpha=1[lt];"
           f"{prev}[lt]overlay=0:{SZ-150}:enable='between(t,{lt_in:.2f},{m_end:.2f})'[withlt];"
           f"[{N+1}:a]showwaves=s={SZ}x90:mode=cline:rate={FPS}:colors=0x00F0FF|0xFF1493:draw=full[wave];"
           f"[withlt][wave]overlay=0:{SZ-92}:shortest=1[wv];"
           f"[{N+2}:v]format=rgba[intro];"
           f"[wv][intro]overlay=0:0:enable='lt(t,{intro_dur:.2f})',format=yuv420p[vout]")
    ff(*inputs, "-filter_complex", fc, "-map", "[vout]", "-map", f"{N+1}:a",
       "-t", f"{total:.2f}", "-r", str(FPS), "-c:v", "libx264", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(OUT / "trailer.mp4"))
    print(f"  -> trailer.mp4 (1080x1080, {total:.0f}s, title-reveal intro + glow-pulse end card)")


if __name__ == "__main__":
    main()
