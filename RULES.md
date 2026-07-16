# RULES.md — Enforceable Studio Rules

These rules bind every piece of work in this repo — human or AI. Each rule is
checkable; "Gate" lines say how it is enforced. If work violates a rule, the
work changes, not the rule (change the rule here first if it must move).

---

## 1. Universe / canon

1.1 Every title is a **transmission from Spaceship Alpha 9**, narrated or
    inhabited by **Space Pirate Zero**. Register new titles in the
    `UNIVERSE.md` §3 transmission ledger *before* drafting.
    *Gate: PR touching a new `books/<name>/` must also touch `UNIVERSE.md`.*

1.2 The shared law (UNIVERSE.md §4) is canon: counterfeit vs. honest is the
    axis; the machine is never the villain — dishonesty is; "beige" is the
    artifact word for counterfeit comfort; cameos travel, plots don't.
    *Gate: outline/canon review against §4 before drafting begins.*

1.3 Never contradict canon in a book. Change `UNIVERSE.md` first, then the book.

## 2. Voice (Space Pirate Zero)

2.1 SPZ's voice is identical across every property. Source of truth:
    `brand/spz/verbal.md` + `brand/spz/brand.json`.

2.2 Register: raw, punk, nihilist-cool, "someone talking at a bar at midnight."
    **Active voice only. Punch up, never down** — at systems, never at workers.

2.3 Banned corporate vocabulary (auto-reject in prose and copy): *leverage,
    synergy, ecosystem, transform* (say "refinance"), and the full list in each
    book's `voice.md` Part 2 / `ANTI-SLOP.md`.
    *Gate: `evaluate.py` mechanical scan; grep before publishing copy.*

2.4 Taglines: studio = **"Signal finds signal."** Kicker on motion/social:
    **"A SPACE PIRATE ZERO TRANSMISSION."**

## 3. Brand (visual)

Source of truth: `brand/spz/*.json`. Checklist form: `brand/spz/ENFORCEMENT.md`.

3.1 Palette is exactly: void `#030303` (never pure `#000000`), pink `#FF1493`,
    cyan `#00F0FF`, paper `#E8E8E8`, muted `#8A90A0`. No other hues.
    *Gate: any new hex in a diff that isn't one of these five is a violation.*

3.2 Never pink-on-cyan or cyan-on-pink — separate with void or paper.

3.3 Fonts: Orbitron (display, all-caps) / Space Grotesk (body) / JetBrains Mono
    (code, kickers, metadata — often cyan). EB Garamond only as cover serif.
    Fonts ship from `fonts/`; text is baked with Pillow (this ffmpeg has **no
    drawtext**).

3.4 One brand kit. `brand/spz/brand_kit.html` is the deliverable; regenerate it
    by editing `build_brand_kit.py`. **Never fork a variant kit.** Per-book
    style files (e.g. `asset-mcp/brand/spz_style.json`) derive from these
    tokens and must not drift.

3.5 **One spaceship.** The Spaceship Alpha 9 vessel has exactly one canonical
    design (UNIVERSE.md §1a): cel-shaded saucer, glass dome cockpit with empty
    twin seats, neon-pink circuit-grid hull, pink "SPACESHIP ALPHA 9"
    nameplate, red-tipped antenna beacon, cyan rim light, mint-teal tractor
    beam on the subject below. It is the ONLY ship allowed in any art, for any
    property or product. Scenes vary under the beam; the ship never does.
    *Gate: `brand/spz/ENFORCEMENT.md` vessel check; generation conditions on
    the `brand-spz` reference renders in asset-mcp (`reference_asset_ids`).*

## 4. Sonic

4.1 Industrial-goth engine ~**70 BPM**; the maneki-neko bell is the sonic
    logo; mix target **−16 LUFS**, bed ducking −16 dB, `alimiter=0.97`.

4.2 Voices: only SPZ brand voice IDs from `brand/spz/voices.json`. Hero
    narrator = `8bOIcU4hJx9LYJV4NS1I` on `eleven_v3` (machine/AI characters on
    `eleven_multilingual_v2`). New voices get added to `voices.json` first.

4.3 Music generators never name real artists in prompts (they reject; use
    style language instead).

## 5. Production pipelines

5.1 The four playbooks in `standards/` are the only sanctioned path from
    manuscript → audiobook → published podcast/site → social launch.
    Reference implementation: `books/the-last-human-ceo/` + `publishing/`.

5.2 Approved audio settings are frozen per book in
    `audiobook/PRODUCTION_SPEC.md`. Long renders run detached and resume-safe.

5.3 Never run `run_pipeline.py --from-scratch` or `--phase foundation` on a
    book with a hand-authored foundation — it overwrites it.

5.4 Costs are real (ElevenLabs, Gemini bill per call). Batch, cache, resume;
    no re-render without a reason.

## 6. Publishing & web

6.1 Big media lives in GCS (`spz-podcasts`, `spz-assets`), never served from
    the app container and never committed to git.

6.2 Canonical URLs, OG tags, JSON-LD, and sitemaps use the custom
    `public_url` domain — never the `*.run.app` host.

6.3 Feed + site endpoints accept **GET and HEAD** (Apple's crawler HEADs the
    feed). Podcast services deploy with `--min-instances 1`.

6.4 `publishing/config.json` is the only per-book file that changes to publish
    a new show.

6.5 DNS changes go through Cloudflare and get recorded in `DNS.md` in the same
    change. `infra/sa9-sites/` GKE manifests are STALE — prod is Cloud Run.

## 7. Assets

7.1 Every finished asset (image, video, audio, copy, kit) gets ingested into
    the **asset-mcp** catalog (`gs://spz-assets`, service `spz-asset-mcp`) —
    it is the studio's main endpoint and single source for finding assets.

7.2 New social/marketing images are generated through
    `asset-mcp generate_asset` (on-brand by construction) rather than raw
    prompts, whenever the endpoint is available.

## 8. Repo hygiene

8.0 **Repo boundary — this repo IS the studio.** Division of responsibility
    (canon: `web/STUDIO-MIGRATION-PLAN.md`):
    - **HERE (autonovel = studio):** books, podcasts, the album, brand kit +
      art generation, publishing/SEO/press, socials, Substack/dispatches, and
      the **marketing web** — spaceshipalpha9.co (`web/sa9-website/`) and
      spacepiratezero.com (`web/spz-site/`).
    - **SpaceShipAlpha9 repo (products):** hardcore product code only —
      StyleLift app, GhostDeck, DARKWAVE, TradeCraft, OSMIX, product
      infra/k8s.
    **Never put studio stuff in the SpaceShipAlpha9 repo** — if it's about a
    story, a launch, brand content, marketing, or a book/site experience, it
    belongs in this repo, full stop.

8.1 Books are self-contained under `books/<name>/`. No new work at repo root;
    the root pipeline files are a frozen duplicate of Digital Insurgency.

8.2 Secrets never enter git: `.env`, Apple `.p8`/`.pem`, bearer tokens.
    Secrets live in Google Secret Manager (project `stylelift`);
    `load-secrets.sh` regenerates `.env`.

8.3 Long-running work happens on `spz/*` branches in worktrees, and gets
    recorded in `docs/BRANCHES.md` (what/where/status) so it can't be lost.

8.4 Follow OpenWolf duties every session: check `.wolf/anatomy.md` and
    `.wolf/cerebrum.md` first; log fixes to `.wolf/buglog.json`; append
    sessions to `.wolf/memory.md`; keep `anatomy.md` current.

8.5 **PR protocol.**
    - **Never say "Claude"** — or otherwise reference AI assistance — anywhere
      in a PR: not in the title, not in the description, not in comments. No
      "Generated with Claude Code" footers, no AI co-author credits in the PR
      body. PRs read as studio work, full stop.
    - **Lifecycle is fixed:** open → review → resolve **all** issues → merge.
      Every PR gets a code review after opening; every finding is resolved
      (fixed, or explicitly rejected with a reason on the PR) before merge.
      Never merge with open findings, and never skip the review.
    *Gate: check the PR body for the string "laude" before opening; check the
    review thread is fully resolved before merging.*

## 9. Content lines (never cross)

9.1 Never punch down at workers — only up at the system.
9.2 REAPER (Digital Insurgency) is an environment, never a character/body.
9.3 No chapter "defeats/destroys" PRISM/REAPER (violates Claim 4).
9.4 The AI is an honest mirror, not a monster (UNIVERSE.md §4).
