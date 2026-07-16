# SPZ Brand Enforcement Checklist

The pass/fail gate for **any** public artifact — image, video, audio, copy,
site, deck. Source of truth is the token files in this folder; this checklist
is how you enforce them. Studio-wide rules: [../../RULES.md](../../RULES.md).

Run this before shipping. Any ✗ means the artifact goes back.

## Visual

- [ ] **Palette only:** void `#030303`, pink `#FF1493`, cyan `#00F0FF`,
      paper `#E8E8E8`, muted `#8A90A0`. No other hues anywhere
      (`grep -oiE '#[0-9a-f]{6}'` the source and diff against these five).
- [ ] Background is **void**, never pure `#000000`.
- [ ] **No pink-on-cyan / cyan-on-pink** — separated by void or paper.
- [ ] Fonts: Orbitron (display, ALL-CAPS) / Space Grotesk (body) /
      JetBrains Mono (code, kickers, metadata). EB Garamond only on covers.
- [ ] Fonts loaded from `fonts/` (self-hosted / embedded); text on video baked
      with Pillow — never ffmpeg drawtext.
- [ ] Mood: industrial-goth cyberpunk noir; newsprint/VHS grit acceptable;
      no gradients outside the palette, no stock-photo look.
- [ ] **The vessel:** if a spaceship appears, it is THE canonical Spaceship
      Alpha 9 saucer (UNIVERSE.md §1a — glass dome + empty twin seats, pink
      circuit-grid hull, pink "SPACESHIP ALPHA 9" nameplate, red-tipped
      antenna, cyan rim light, teal tractor beam). No other ship design,
      ever. Generation must condition on the `brand-spz` reference renders
      (`reference_asset_ids` in asset-mcp `generate_asset`).

## Motion / social

- [ ] Kicker present: **"A SPACE PIRATE ZERO TRANSMISSION"** (JetBrains Mono,
      usually cyan).
- [ ] Waveforms `showwaves colors=0x00F0FF|0xFF1493` (cyan→pink).
- [ ] Glow-pulse on the CTA only — nowhere else.

## Audio

- [ ] ~70 BPM industrial-goth engine; maneki-neko bell as sonic logo.
- [ ] Mix: target −16 LUFS, bed ducked −16 dB, `alimiter=0.97`.
- [ ] Voices only from `voices.json`; narrator = SPZ `8bOIcU4hJx9LYJV4NS1I`
      on `eleven_v3` (machine/AI voices on `eleven_multilingual_v2`).
- [ ] Music prompts never name real artists.

## Verbal

- [ ] SPZ voice: bar-at-midnight, punk, active voice only.
- [ ] **Punch up, never down.**
- [ ] Zero banned corporate vocabulary (leverage / synergy / ecosystem /
      transform / etc. — full list in `verbal.md` + book `voice.md` Part 2;
      grep the copy).
- [ ] Tagline where appropriate: **"Signal finds signal."**
- [ ] Every release framed as a transmission from Spaceship Alpha 9.

## Kit integrity

- [ ] One kit: changes go into the JSON token files + `build_brand_kit.py`,
      then regenerate `brand_kit.html`. **No forked variants, ever.**
- [ ] Derived style files (e.g. `asset-mcp/brand/spz_style.json`) match these
      tokens — fix drift at the source.
- [ ] Redeploy `brand_kit.html` to the same artifact URL (no new URLs).

## Automated enforcement hooks

- Prose/copy: `evaluate.py` mechanical scan (banned words, slop patterns).
- Images: generate through `asset-mcp generate_asset` — on-brand by
  construction (house style in `asset-mcp/brand/spz_style.json`).
- Hex audit: `grep -roiE '#[0-9a-f]{6}' <artifact source> | sort -u` →
  subtract the five brand hexes → remainder must be empty.

## Build notes

`build_brand_kit.py` is repo-relative (fixed 2026-07-15): fonts from
`<repo>/fonts`, clips from `brand/spz/clips/`, output in place — overridable
via `BRAND_KIT_FONTS`/`_CLIPS`/`_OUT`. Rebuild verified byte-identical.

Canonical likenesses (same law as the palette — never redesign):
- **The vessel** — renders in `books/digital-insurgency/art/spaceships/`
  (UNIVERSE.md §1a).
- **SPZ himself** — `SPZ-HEADSHOT.png` at repo root (mirror
  `brand/spz/spz-headshot.png`). Never regenerate or swap his face.
