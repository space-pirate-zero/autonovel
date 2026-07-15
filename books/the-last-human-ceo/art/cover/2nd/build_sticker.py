#!/usr/bin/env python3
"""
Circular SA9 emblem die-cut stickers for The Last Human CEO.
Five variants, each a "warning to the human CEOs still left" + a QR to the site.
Run: uv run --with pillow --with qrcode python3 art/cover/2nd/build_sticker.py
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import qrcode
from qrcode.constants import ERROR_CORRECT_H

HERE = Path(__file__).resolve().parent
BOOK = HERE.parents[2]
F = BOOK.parent.parent / "fonts"
VOID = (3, 3, 3); PINK = (255, 20, 147); CYAN = (0, 240, 255); PAPER = (232, 232, 232); MUTED = (150, 156, 172)
SZ = 1500; CX = CY = SZ // 2; RED = SZ // 2 - 8
URL = "https://lasthumanceo.com"

# five warnings to the human CEOs still in the chair
TAGS = [
    ("THE MACHINE", "IS COMING FOR YOU", "01_coming"),
    ("IT NEVER SLEEPS", "IT NEVER LIES", "02_nosleep"),
    ("YOU ARE A", "KEY-MAN RISK", "03_keyman"),
    ("CHEAPER. SHARPER.", "SCANDAL-PROOF.", "04_cheaper"),
    ("THE BOARD", "ALREADY DID THE MATH", "05_math"),
]


def fnt(n, s): return ImageFont.truetype(str(F / n), s)
def fit(d, t, n, s, mw):
    while s > 14 and d.textlength(t, font=fnt(n, s)) > mw: s -= 2
    return fnt(n, s)


def arc_text(base, text, font, fill, radius, center_deg, bottom=False, spacing=1.0):
    if bottom:
        text = text[::-1]
    sc = ImageDraw.Draw(base)
    ws = [sc.textlength(c, font=font) for c in text]
    bb = font.getbbox("AWy"); ch = bb[3] - bb[1]; pad = 10
    ang = center_deg - sum(math.degrees(w * spacing / radius) for w in ws) / 2
    for c, w in zip(text, ws):
        seg = math.degrees(w * spacing / radius); a = ang + seg / 2; r = math.radians(a)
        x = CX + radius * math.cos(r); y = CY + radius * math.sin(r)
        tile = Image.new("RGBA", (int(w) + 2 * pad, ch + 2 * pad), (0, 0, 0, 0))
        ImageDraw.Draw(tile).text((pad, pad - bb[1]), c, font=font, fill=fill + (255,))
        tile = tile.rotate(-(a - 90) if bottom else -(a + 90), expand=True, resample=Image.BICUBIC)
        base.alpha_composite(tile, (int(x - tile.width / 2), int(y - tile.height / 2)))
        ang += seg


def qr_img(px):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=12, border=2)
    qr.add_data(URL); qr.make(fit=True)
    q = qr.make_image(fill_color=(6, 6, 8), back_color=(255, 255, 255)).convert("RGBA").resize((px, px))
    pad = 26; panel = Image.new("RGBA", (px + 2*pad, px + 2*pad), (0, 0, 0, 0)); pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((0, 0, px + 2*pad, px + 2*pad), radius=32, fill=PAPER + (255,))
    pd.rounded_rectangle((0, 0, px + 2*pad, px + 2*pad), radius=32, outline=CYAN + (255,), width=8)
    panel.alpha_composite(q, (pad, pad))
    return panel


def make(l1, l2):
    img = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0))
    disc = Image.new("RGBA", (SZ, SZ), VOID + (255,))
    ov = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.ellipse((-SZ*0.15, -SZ*0.2, SZ*0.75, SZ*0.5), fill=(255, 20, 147, 80))
    od.ellipse((SZ*0.3, SZ*0.55, SZ*1.2, SZ*1.25), fill=(0, 240, 255, 70))
    disc = Image.alpha_composite(disc, ov.filter(ImageFilter.GaussianBlur(150)))
    mask = Image.new("L", (SZ, SZ), 0); ImageDraw.Draw(mask).ellipse((0, 0, SZ-1, SZ-1), fill=255)
    img.paste(disc, (0, 0), mask)

    # SA9 saucer (lighten; black crushed) — beam points down toward the message
    glow = Image.new("RGBA", (SZ, SZ), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((CX-320, 150, CX+320, 560), fill=(0, 240, 255, 55))
    ImageDraw.Draw(glow).ellipse((CX-340, 120, CX+340, 470), fill=(255, 20, 147, 45))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(85)))
    ship = Image.open(HERE / "ship.png").convert("RGB").resize((720, 720)).point(lambda p: 0 if p < 26 else p)
    layer = Image.new("RGB", (SZ, SZ), (0, 0, 0)); layer.paste(ship, (CX - 360, 96))
    lit = ImageChops.lighter(img.convert("RGB"), layer).convert("RGBA"); lit.putalpha(img.split()[3]); img = lit

    d = ImageDraw.Draw(img)
    def cline(text, y, font, fill, glow=None):
        tw = d.textlength(text, font=font)
        if glow:
            h = Image.new("RGBA", img.size, (0, 0, 0, 0))
            ImageDraw.Draw(h).text(((SZ-tw)/2, y), text, font=font, fill=glow+(220,))
            img.alpha_composite(h.filter(ImageFilter.GaussianBlur(14)))
        ImageDraw.Draw(img).text(((SZ-tw)/2, y), text, font=font, fill=fill+(255,))
    cline(l1, 726, fit(d, l1, "Orbitron-900.ttf", 84, SZ-380), PAPER, PINK)
    cline(l2, 832, fit(d, l2, "Orbitron-700.ttf", 58, SZ-380), PINK)

    panel = qr_img(280)
    img.alpha_composite(panel, (CX - panel.width // 2, 918))
    cline("SCAN  &  LISTEN  FREE", 1262, fnt("Orbitron-700.ttf", 34), CYAN)

    arc_text(img, "THE LAST HUMAN CEO", fnt("Orbitron-900.ttf", 74), PAPER, RED - 96, -90)
    arc_text(img, "LASTHUMANCEO.COM   ·   YOU'VE BEEN WARNED", fnt("JetBrainsMono-700.ttf", 38), CYAN, RED - 92, 90, bottom=True)
    for a in (0, 180):
        r = math.radians(a); x = CX + (RED-92)*math.cos(r); y = CY + (RED-92)*math.sin(r)
        ImageDraw.Draw(img).regular_polygon((x, y, 16), 4, rotation=45, fill=PINK+(255,))

    dd = ImageDraw.Draw(img)
    dd.ellipse((14, 14, SZ-15, SZ-15), outline=CYAN + (255,), width=12)
    dd.ellipse((44, 44, SZ-45, SZ-45), outline=PINK + (200,), width=5)
    for deg in range(0, 360, 5):
        r = math.radians(deg); r1, r2 = RED - 30, RED - 46
        dd.line((CX + r1*math.cos(r), CY + r1*math.sin(r), CX + r2*math.cos(r), CY + r2*math.sin(r)),
                fill=(CYAN if deg % 15 == 0 else MUTED) + (200,), width=3 if deg % 15 == 0 else 2)

    img.putalpha(ImageChops.multiply(img.split()[3], mask))
    return img


def main():
    outdir = HERE / "stickers"; outdir.mkdir(exist_ok=True)
    thumbs = []
    for l1, l2, slug in TAGS:
        im = make(l1, l2)
        im.save(outdir / f"sticker_{slug}_diecut.png")
        thumbs.append(im)
    # contact sheet proof (all 5 on light bg)
    cols = 3; tw = 470; gap = 30
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols*tw + (cols+1)*gap, rows*tw + (rows+1)*gap), (238, 238, 242))
    for i, im in enumerate(thumbs):
        t = im.resize((tw, tw)); r, c = divmod(i, cols)
        sheet.paste(t, (gap + c*(tw+gap), gap + r*(tw+gap)), t)
    sheet.save(HERE / "stickers_contact_sheet.jpg", quality=92)
    print(f"saved {len(thumbs)} stickers -> stickers/  + stickers_contact_sheet.jpg")


if __name__ == "__main__":
    main()
