#!/usr/bin/env python3
"""
gen_video.py — audiogram social videos with MOTION GRAPHICS + glow-pulse.
Static background (cover + kicker) + a reactive waveform, and the title,
"NOW STREAMING", and lasthumanceo.com animating in (staggered fade+slide) —
with a soft neon glow that gently pulses on NOW STREAMING and the link.

ffmpeg here lacks drawtext, so the animated text is a Pillow RGBA frame
sequence composited over the ffmpeg-drawn background + waveform.

Outputs social/video/audiogram_square.mp4 (1080²) + _vertical.mp4 (1080x1920).
Run:  uv run --with pillow python3 social/gen_video.py
"""
import subprocess, tempfile, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "social" / "video"; OUT.mkdir(parents=True, exist_ok=True)
F = BASE.parent.parent / "fonts"
COVER = BASE / "art" / "podcast_cover_src.png"
HOOK_SRC = BASE / "audiobook" / "produced" / "ch_01_PRODUCED.mp3"
TMP = Path(tempfile.mkdtemp(prefix="tlhc_ag_"))
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (138, 144, 160)
FPS = 30


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 10 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)
def ff(*a): subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)
def ease(p): return 1 - (1 - max(0.0, min(1.0, p))) ** 3


def canvas(w, h):
    img = Image.new("RGBA", (w, h), VOID + (255,))
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.ellipse((-w*0.2, -h*0.2, w*0.5, h*0.28), fill=(255, 20, 147, 40))
    d.ellipse((w*0.6, h*0.6, w*1.3, h*1.25), fill=(0, 240, 255, 28))
    return Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(60)))


def glow_text(base, text, font, rgb, y, alpha, glow=0.0):
    """Composite centered text onto RGBA `base` at row y with a cheap blurred halo."""
    if alpha <= 0: return
    W = base.width
    sd = ImageDraw.Draw(base)
    tw = sd.textlength(text, font=font)
    bb = font.getbbox(text); th = bb[3] - bb[1]
    pad = 28
    x = (W - tw) / 2
    tile = Image.new("RGBA", (int(tw) + 2*pad, int(th) + 2*pad), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    if glow > 0:
        halo = Image.new("RGBA", tile.size, (0, 0, 0, 0))
        hd = ImageDraw.Draw(halo)
        hd.text((pad, pad - bb[1]), text, font=font, fill=rgb + (int(255 * glow),))
        tile.alpha_composite(halo.filter(ImageFilter.GaussianBlur(11)))
    td.text((pad, pad - bb[1]), text, font=font, fill=rgb + (int(255 * alpha),))
    base.alpha_composite(tile, (int(x - pad), int(y - pad)))


def layout(kind):
    if kind == "square":
        W = H = 1080; cov = 520; covy = 60
        ky, nsy, ty = 604, 656, 706
        band_y, band_h = 810, 150
        ly = band_y + band_h + 22
        kick_s, ns_s, link_s = 22, 30, 28
        title_max, title_s = W - 100, 58
    else:
        W, H = 1080, 1920; cov = 720; covy = 250
        ky, nsy, ty = 1030, 1086, 1140
        band_y, band_h = 1320, 200
        ly = band_y + band_h + 40
        kick_s, ns_s, link_s = 24, 40, 34
        title_max, title_s = W - 100, 66
    return dict(W=W, H=H, cov=cov, covy=covy, ky=ky, nsy=nsy, ty=ty,
                band_y=band_y, band_h=band_h, ly=ly,
                kick_s=kick_s, ns_s=ns_s, link_s=link_s, title_max=title_max, title_s=title_s)


def build_bg(L):
    W, H, cov, covy, ky = L["W"], L["H"], L["cov"], L["covy"], L["ky"]
    base = canvas(W, H)
    c = Image.open(COVER).convert("RGB").resize((cov, cov)); base.paste(c, ((W - cov) // 2, covy))
    d = ImageDraw.Draw(base)
    kf = fnt("JetBrainsMono-400.ttf", L["kick_s"])
    d.text(((W - d.textlength("A SPACE PIRATE ZERO TRANSMISSION", font=kf)) / 2, ky),
           "A SPACE PIRATE ZERO TRANSMISSION", font=kf, fill=CYAN + (255,))
    p = TMP / f"bg_{L['ns_s']}.png"; base.convert("RGB").save(p); return p


def overlay_seq(kind, L, dur):
    """Transparent text-overlay frame sequence: fade+slide in, then glow-pulse."""
    d = TMP / f"ov_{kind}"; d.mkdir()
    W, H = L["W"], L["H"]
    md = ImageDraw.Draw(Image.new("RGB", (W, H)))
    tf = fit(md, "THE LAST HUMAN CEO", "Orbitron-900.ttf", L["title_s"], L["title_max"])
    nsf = fnt("Orbitron-700.ttf", L["ns_s"]); lkf = fnt("JetBrainsMono-400.ttf", L["link_s"])
    n = int(dur * FPS)
    for i in range(n):
        t = i / FPS
        fr = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        # NOW STREAMING: fade+slide in @0.4, glow-pulse after
        a = ease((t - 0.4) / 0.5); sl = int((1 - a) * 18)
        pg = 0.30 + 0.30 * (0.5 + 0.5 * math.sin((t - 0.9) * 2.4)) if t > 0.9 else 0.0
        glow_text(fr, "NOW STREAMING", nsf, PINK, L["nsy"] + sl, a, pg)
        # title: fade+slide in @0.8, steady
        a = ease((t - 0.8) / 0.5); sl = int((1 - a) * 18)
        glow_text(fr, "THE LAST HUMAN CEO", tf, PAPER, L["ty"] + sl, a, 0.0)
        # link: fade+slide in @1.2, glow-pulse after
        a = ease((t - 1.2) / 0.5); sl = int((1 - a) * 18)
        pg = 0.28 + 0.32 * (0.5 + 0.5 * math.sin((t - 1.7) * 2.4)) if t > 1.7 else 0.0
        glow_text(fr, "lasthumanceo.com", lkf, PINK, L["ly"] + sl, a, pg)
        fr.save(d / f"f_{i:04d}.png")
    return d, n


def hook(dur=22):
    p = TMP / "hook.m4a"
    ff("-ss", "0", "-t", str(dur), "-i", str(HOOK_SRC), "-vn", "-map", "0:a",
       "-af", f"afade=t=out:st={dur-2}:d=2,loudnorm=I=-14:TP=-1.5", "-c:a", "aac", "-b:a", "192k", str(p))
    return p, dur


def render(kind, audio, dur):
    L = layout(kind); W, H, by, bh = L["W"], L["H"], L["band_y"], L["band_h"]
    bgp = build_bg(L)
    ovd, _ = overlay_seq(kind, L, dur)
    inputs = ["-loop", "1", "-t", str(dur), "-i", str(bgp),      # 0 bg
              "-i", str(audio),                                  # 1 audio
              "-framerate", str(FPS), "-i", f"{ovd}/f_%04d.png"] # 2 text overlay seq
    fc = (f"[1:a]showwaves=s={W}x{bh}:mode=cline:rate={FPS}:colors=0x00F0FF|0xFF1493:draw=full[w];"
          f"[0:v][w]overlay=(W-w)/2:{by}[bg];"
          f"[bg][2:v]overlay=0:0:shortest=1,format=yuv420p[vout]")
    out = OUT / f"audiogram_{kind}.mp4"
    ff(*inputs, "-filter_complex", fc, "-map", "[vout]", "-map", "1:a",
       "-t", str(dur), "-r", str(FPS), "-c:v", "libx264", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out))
    print(f"  -> {out.name} ({W}x{H}, glow-pulse motion)")


def main():
    audio, dur = hook(22)
    render("square", audio, dur)
    render("vertical", audio, dur)


if __name__ == "__main__":
    main()
