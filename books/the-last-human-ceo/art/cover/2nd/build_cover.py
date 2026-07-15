#!/usr/bin/env python3
"""Dynamic 2nd-edition cover for The Last Human CEO — anime hero + SPZ brand type."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import qrcode
from qrcode.constants import ERROR_CORRECT_H

HERE = Path(__file__).resolve().parent
BOOK = HERE.parents[2]          # .../the-last-human-ceo (2nd -> cover -> art -> book)
F = BOOK.parent.parent / "fonts"
EP = BOOK / "art" / "episodes"
W, H = 1600, 2400
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (138, 144, 160)


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 20 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)


def canvas():
    img = Image.new("RGBA", (W, H), VOID + (255,))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.ellipse((-W*0.3, -H*0.05, W*0.7, H*0.30), fill=(255, 20, 147, 60))
    d.ellipse((W*0.4, H*0.62, W*1.4, H*1.05), fill=(0, 240, 255, 46))
    d.ellipse((W*0.55, -H*0.05, W*1.25, H*0.22), fill=(0, 240, 255, 30))
    img = Image.alpha_composite(img, ov.filter(ImageFilter.GaussianBlur(120)))
    # diagonal motion streaks
    st = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    for i, (x0, col, a, wd) in enumerate([(-200, CYAN, 70, 3), (200, PINK, 60, 2), (700, CYAN, 40, 2),
                                          (1100, PINK, 55, 3), (1500, CYAN, 45, 2)]):
        sd.line((x0, H*0.1, x0 + 900, H), fill=col + (a,), width=wd)
    img = Image.alpha_composite(img, st.filter(ImageFilter.GaussianBlur(2)))
    return img


def neon_text(base, text, font, y, fill, glow, cx=None, chroma=6):
    """Centered neon text with chromatic offset + glow."""
    d = ImageDraw.Draw(base); tw = d.textlength(text, font=font)
    x = (W - tw) / 2 if cx is None else cx
    bb = font.getbbox(text)
    halo = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(halo).text((x, y), text, font=font, fill=glow + (200,))
    base.alpha_composite(halo.filter(ImageFilter.GaussianBlur(18)))
    d.text((x - chroma, y), text, font=font, fill=CYAN + (150,))     # chromatic ghost
    d.text((x + chroma, y), text, font=font, fill=(255, 20, 147, 150))
    d.text((x, y), text, font=font, fill=fill + (255,))
    return bb[3] - bb[1]


def shard(path, size, angle):
    """Softly-blended holographic panel: feathered edges + neon glow."""
    im = Image.open(path).convert("RGBA").resize((size, size))
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size-1, size-1), radius=26, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(7))
    im.putalpha(ImageChops.multiply(im.split()[3], m))
    pad = 46
    c = Image.new("RGBA", (size + 2*pad, size + 2*pad), (0, 0, 0, 0))
    g = Image.new("RGBA", c.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).rounded_rectangle((pad-6, pad-6, pad+size+6, pad+size+6), radius=32, outline=CYAN+(255,), width=10)
    c.alpha_composite(g.filter(ImageFilter.GaussianBlur(16)))
    c.alpha_composite(im, (pad, pad))
    ImageDraw.Draw(c).rounded_rectangle((pad, pad, pad+size-1, pad+size-1), radius=26, outline=CYAN+(190,), width=3)
    return c.rotate(angle, expand=True, resample=Image.BICUBIC)


def qr_panel(px):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data("https://lasthumanceo.com"); qr.make(fit=True)
    q = qr.make_image(fill_color=(6, 6, 8), back_color=(255, 255, 255)).convert("RGBA").resize((px, px))
    pad = 20; panel = Image.new("RGBA", (px+2*pad, px+2*pad), (0, 0, 0, 0)); pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((0, 0, px+2*pad, px+2*pad), radius=24, fill=PAPER + (255,))
    pd.rounded_rectangle((0, 0, px+2*pad, px+2*pad), radius=24, outline=CYAN + (255,), width=6)
    panel.alpha_composite(q, (pad, pad))
    return panel


def main():
    img = canvas()

    # hero — full-width, lower-centred, top faded into void
    hero = Image.open(HERE / "hero.png").convert("RGBA")
    hw = 1560; hero = hero.resize((hw, hw))
    fade = Image.new("L", (hw, hw), 255); fd = ImageDraw.Draw(fade)
    for yy in range(300):
        fd.line((0, yy, hw, yy), fill=int(255 * (yy / 300)))
    hero.putalpha(Image.composite(hero.split()[3], Image.new("L", (hw, hw), 0), fade))
    img.alpha_composite(hero, ((W - hw) // 2, 700))

    # softly-blended holographic panels + a QR to the site
    img.alpha_composite(shard(EP / "ep01.jpg", 250, 10), (26, 1120))
    img.alpha_composite(shard(EP / "ep13.jpg", 250, -9), (1300, 1760))
    qp = qr_panel(190)
    qx, qy = 40, 1980
    img.alpha_composite(qp, (qx, qy))
    dq = ImageDraw.Draw(img); scf = fnt("JetBrainsMono-700.ttf", 22)
    sc = "SCAN — LISTEN"
    dq.text((qx + (qp.width - dq.textlength(sc, font=scf)) / 2, qy + qp.height + 2), sc, font=scf, fill=CYAN + (255,))

    d = ImageDraw.Draw(img)
    # kicker
    kf = fnt("JetBrainsMono-700.ttf", 32)
    kt = "A FULL-CAST AUDIO DRAMA"
    d.text(((W - d.textlength(kt, font=kf)) / 2, 96), kt, font=kf, fill=CYAN + (255,))

    # title lockup
    t1f = fit(d, "THE LAST HUMAN", "Orbitron-900.ttf", 150, W - 150)
    t2f = fnt("Orbitron-900.ttf", 250)
    while d.textlength("CEO", font=t2f) > W - 150: t2f = fnt("Orbitron-900.ttf", t2f.size - 4)
    neon_text(img, "THE LAST HUMAN", t1f, 170, PAPER, PINK)
    neon_text(img, "CEO", t2f, 300, PAPER, PINK, chroma=9)
    d = ImageDraw.Draw(img)

    # dark scrim so author + tagline read over the figure
    scrim = Image.new("RGBA", (W, 300), (0, 0, 0, 0)); sdr = ImageDraw.Draw(scrim)
    for i in range(300):
        sdr.line((0, i, W, i), fill=(3, 3, 3, int(240 * (i / 300))))
    img.alpha_composite(scrim, (0, H - 300)); d = ImageDraw.Draw(img)
    # author + tagline
    af = fnt("Orbitron-700.ttf", 62)
    d.text(((W - d.textlength("SPACE PIRATE ZERO", font=af)) / 2, 2250), "SPACE PIRATE ZERO", font=af, fill=PAPER + (255,))
    tag = "SLEEPLESS  ·  COKE-BRIGHT  ·  MAGNIFICENT  ·  DOOMED"
    tf = fit(d, tag, "JetBrainsMono-400.ttf", 32, W - 120)
    d.text(((W - d.textlength(tag, font=tf)) / 2, 2330), tag, font=tf, fill=CYAN + (255,))

    # SECOND EDITION badge — centered pill in the gap below the title
    ef = fnt("Orbitron-700.ttf", 46)
    et = "SECOND EDITION"
    pad = 46; tw = int(ef.getlength(et)); bw, bh = tw + pad * 2, 96
    badge = Image.new("RGBA", (bw + 80, bh + 80), (0, 0, 0, 0)); bd = ImageDraw.Draw(badge)
    glow = Image.new("RGBA", badge.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle((40, 40, 40 + bw, 40 + bh), radius=bh // 2, fill=PINK + (180,))
    badge.alpha_composite(glow.filter(ImageFilter.GaussianBlur(22)))
    bd.rounded_rectangle((40, 40, 40 + bw, 40 + bh), radius=bh // 2, fill=PINK + (255,))
    bd.rounded_rectangle((40, 40, 40 + bw, 40 + bh), radius=bh // 2, outline=CYAN + (255,), width=4)
    bd.text((40 + pad, 40 + (bh - (ef.getbbox(et)[3] - ef.getbbox(et)[1])) // 2 - ef.getbbox(et)[1]),
            et, font=ef, fill=(10, 2, 8, 255))
    badge = badge.rotate(-2.5, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(badge, ((W - badge.width) // 2, 560))

    # SA9 saucer beaming down in the upper-left void
    ship = Image.open(HERE / "ship.png").convert("RGB").resize((560, 560)).point(lambda p: 0 if p < 26 else p)
    layer = Image.new("RGB", img.size, (0, 0, 0)); layer.paste(ship, (30, 560))
    lit = ImageChops.lighter(img.convert("RGB"), layer).convert("RGBA"); lit.putalpha(img.split()[3]); img = lit

    out = HERE / "the_last_human_ceo_2nd_edition_cover.png"
    img.convert("RGB").save(out, quality=95)
    print(f"saved {out}  ({W}x{H})")


if __name__ == "__main__":
    main()
