# Digital Insurgency — Website Experience Plan

*A world-class, graphical, interactive companion to the book: read/listen to the
field course, run every exercise graphically, pass the Mirror Tests, sign the Oath,
and auto-generate a verifiable LinkedIn credential on completion.*

**Status: PLAN ONLY. Nothing built.** This document is the blueprint the build
executes against. Working title for the product: **the Glass House** — the
transparent lab where you practice the insurgency on yourself before you try it on
a Fortune 500.

---

## 1. The idea in one paragraph

The book teaches you to smuggle the future past a corporation's immune system — as
*physics* (24 equations), *story* (ZERO's Broadcast), and *practice* (Mirror Tests,
Field Assignments, the Infiltration Canvas, the Oath). The website turns the
*practice* into a graphical experience you can't get from print or audio: you don't
read about the Mirror Test, you **take** it — flip a beautiful product over and find
the rot underneath. You don't read the Dorian Gray Index formula, you **drag the
sliders** and watch the gauge go red. You don't just finish the book; you complete a
**field course**, earn a **rank**, and walk away with a **credential you add to
LinkedIn in one click.** The whole site is scored to a single visual spine: a
rotting portrait that **heals four percent at a time** as you progress — the book's
thesis made literal on screen.

## 2. Experience principles

1. **Show the engine, not the gradient.** The site practices what it preaches: no
   dark patterns, no manufactured scarcity, no engagement traps. It is the
   anti-MirrorMatch. (This is itself a Mirror Test the user can inspect.)
2. **Do, don't read-about.** Every concept has a graphical, interactive form. Text
   is the fallback, not the main event.
3. **Progress you can see.** The healing portrait + rank ladder make the abstract
   "four percent at a time" tangible and motivating.
4. **Low friction, high payoff.** Explore with no account; give an email only when
   you want the badge. Open access to the ideas; identity only for the credential.
5. **World-class craft.** Cinematic cyberpunk motion, but WCAG-AA and
   reduced-motion honored. Fast, accessible, gorgeous — no trade-off.

## 3. Cast as interface

The book's characters become the site's UI voice, so the experience is *narrated*,
not chrome-wrapped:

- **GHOST** — the translucent cyan mesh curator is the **guide/companion**. It
  appears beside exercises, states observations ("I don't predict; I observe"),
  highlights the human fingerprint in a feed, never nags. The site mascot.
- **ZERO** — the protagonist you follow through the story mode; her dossier is the
  template for *your* dossier.
- **SPACE PIRATE ZERO (SPZ)** — the narrator: audio transmissions (podcast), the
  copy voice on cold opens and the closer/CTA moments.
- **REAPER** — the antagonist as **failure state**: fail a Mirror Test and the
  screen desaturates to red wireframe, target-lock crosshairs tighten (never a
  character, always an environment — per canon).
- **The portrait (Dorian Gray)** — the global progress meter; heals as you pass
  modules; the emotional core of the whole UI.

## 4. Information architecture / sitemap

```
/                     Home — "the Broadcast begins." Hero, the portrait, Enter.
/read                 The field course, read. 14 modules, typeset INSURGENT-style.
  /read/[module]        one module: prose + rendered equations + art + inline exercises
/listen               The podcast. 14 episodes, section-scored audio (when produced).
  /listen/[episode]     player + show notes + read-along
/glasshouse           The interactive lab — hub: your portrait, rank, progress map.
  /glasshouse/mirror/[n]     Mirror Test challenges (flip the product, find the rot)
  /glasshouse/physics/[eq]   24 equation calculators (sliders → gauge → meaning)
  /glasshouse/field/[n]      14 Field Assignments (guided worksheets, saved)
  /glasshouse/canvas         The Infiltration Canvas (8-panel interactive worksheet)
  /glasshouse/oath           Sign the Insurgent's Oath (final gate)
/dossier              Your progress dashboard: rank, Insurgent Index, saved work, portrait.
/badge                Post-completion: generate + add to LinkedIn + download + share.
/verify/[certId]      Public credential verification page (anti-fraud).
/about                The book, SPZ, buy links (Kindle/paperback), the SPZ network.
/api/*                progress, credential mint, badge-image, verify (see §9, §10).
```

The **module** is the unit of the journey. Each of the 14 modules =
**Read/Listen → Glass House exercise(s) → Mirror Test checkpoint → portrait heals +
rank updates.** Explorable in any order, but a recommended linear path is the default.

## 5. The four interactive experiences (the "Glass House exercises")

All four already exist as structured content in the repo — this is the site's
biggest head start.

### 5.1 Mirror Tests — "flip the product, find the rot"
- **Source:** the Prologue/Ep 01 Mirror Test + Panel 8 of the Infiltration Canvas.
- **Mechanic:** the user sees a gorgeous fake product (clean UI, a rising green
  "sunrise" gradient, a Webby). They **flip it** (a 3D card flip / peel) to reveal
  the *second dashboard* — the engine: `LONELINESS_EXPLOITATION_INDEX`,
  `MATCH_DELAY_ENGINE`, addiction coefficients. They must **tag the dark pattern**
  (drag-select the exploitation metric, or pick from choices). Correct → the
  portrait heals a notch, GHOST confirms. Wrong → REAPER red-wireframe failure
  state, retry with a hint.
- **Set:** one seed test per module (14), escalating from obvious (match-delay) to
  subtle (a "helpful" default that harvests consent). Panel 8 of the user's own
  Canvas becomes a self-authored Mirror Test at the end.
- **Why it lands:** it *is* the book's central lesson, and it's inherently visual.

### 5.2 Physics calculators — the 24 equations, live
- **Source:** `canon.md` — the 24-equation table already carries formula + variable
  defs + traffic-light benchmarks + worked field reports. This maps **1:1** to a
  calculator widget. Appendix A is the same content.
- **Mechanic:** each equation is a widget — labeled sliders/inputs for each
  variable → a live computed result → an animated **traffic-light gauge**
  (green/yellow/red per the canon thresholds) → a one-line "what this means" and the
  book's move. Pre-loaded with the worked field reports as presets (e.g.
  Authenticity Half-Life, Vendor Gravity, the Dorian Gray Index, Wedge Velocity,
  Trust/Risk).
- **Reusable + embeddable:** each calculator is a standalone component that can be
  embedded in the `/read` prose inline *and* shared/embedded externally (growth).
- **Feeds the score:** the user's own inputs on the key equations feed their
  **Insurgent Index** (§8) — e.g., "compute your team's Consensus Paralysis."

### 5.3 Field Assignments — the 14 "go do this" worksheets
- **Source:** the per-episode Field Assignments in `podcast/episodes.md`
  (e.g. Ep 01 "name the engine under your gradient you ship"; Ep 07 "find the task a
  person does 20× a week by hand").
- **Mechanic:** each is a guided, saved worksheet — a prompt, a text/inputs area,
  optional structure (tables, the Vitamin/Painkiller/Tourniquet triage as a
  drag-sort). Saved to the user's **dossier**; assembles into an exportable
  "insurgency plan."
- **Completion:** doing the assignment (not just reading it) is what advances the
  module. Non-graded, but presence-checked (did you fill it?).

### 5.4 The Infiltration Canvas — the 8-panel tactical board
- **Source:** Appendix B (`chapters/ch_18.md`) — 8 named panels, Panel 8 = the
  Mirror Test pre-mortem.
- **Mechanic:** a single interactive board (think Business Model Canvas, cyberpunk
  skin). Fill each panel for a **real target of the user's choice**; blanks are
  flagged as "your next mission task" (per the appendix's own rule: 3 blanks = a
  deal you're not ready to run). Panels pull relevant calculators (Panel 1
  Environment → the physics; Panel 6 Math → the economics equations).
- **Output:** export the completed Canvas as a branded PDF (the INSURGENT design).
  This is the tangible artifact the course produces.

### 5.5 The Insurgent's Oath — the final ceremony
- **Source:** Ep 13 — five commitments.
- **Mechanic:** the last gate. The five commitments appear one at a time; the user
  affirms each; a signature/"sign the Oath" ceremony (typed name or draw).
  Completing it unlocks the badge. Ritual, not paperwork.

## 6. The reading & listening experience ("experience the book")

- **/read** — the 14 modules typeset in the **INSURGENT design system** ported to
  the web (§7): void background, Orbitron display heads, Space Grotesk body,
  JetBrains Mono for code/config lines, color-coded section banners (BROADCAST /
  LESSON / SPZ CLOSER / boss / benchmark), equations rendered as real math in the
  cyan `\eqbox` treatment (KaTeX). Cyberpunk cold-open art per module.
- **Inline exercises:** calculators and the module's Mirror Test are embedded *in*
  the reading flow — read the Dorian Gray section, then drag the sliders right there.
- **/listen** — the podcast (14 section-scored episodes). When audio is produced,
  add **read-along** (highlight the line being spoken) and the audible section cues
  from `audiobook/SCORE.md`. Text-first until audio ships; the player is scaffolded.
- **Continuity:** read, listen, and do all share the same progress + portrait, so a
  user can switch modes without losing their place.

## 7. Visual & motion design

- **Design system:** port the existing **INSURGENT** system (already defined for
  print in `design/`) to web tokens.
  - Palette: void `#030303`; pink `#ff1493`; cyan `#00f0ff`; amber `#ffab00`; acid
    green; benchmark green/yellow/red. (Contrast-checked to WCAG AA on the void.)
  - Type: Orbitron (display), Space Grotesk (body), JetBrains Mono (code/math) —
    the OFL TTFs are already vendored in `fonts/`.
  - Also reconcile with the canonical **SPZ brand kit** (`brand/spz/`) so the site
    reads as part of the Space Pirate Zero network.
- **Signature motifs:** the **healing portrait** (a hero canvas that visibly
  repairs); GHOST's translucent cyan mesh (WebGL/canvas, degrades to SVG); REAPER's
  red-wireframe failure environment; the "second dashboard" flip; scanline/transmission
  transitions between sections (mirroring the audio section score visually).
- **Motion:** Framer Motion + a light WebGL layer for the portrait/GHOST. Everything
  behind `prefers-reduced-motion`; a "reduce transmission static" toggle.

## 8. Progression, rank & the Insurgent Index

- **The healing portrait:** 14 modules → the portrait heals 1/14 (~7%) per module
  cleared. "Four percent at a time" is the copy; the visual is the payoff.
- **Rank ladder** (shown on the badge): **Decorator → Wedge → Curator → Insurgent →
  Ghost.** Advances with modules completed + Mirror Tests passed.
- **Insurgent Index:** a composite 0–100 computed from the user's own exercise
  inputs and Mirror-Test accuracy — printed on the credential so no two badges are
  identical. (Reuses `I_insurgent` from canon as the model.)
- **Dossier:** the user's dashboard — rank, index, portrait state, saved Field
  Assignments, their Canvas, Mirror-Test record.

## 9. The LinkedIn badge — auto-generation & flow

The completion payoff. Three artifacts are generated automatically, plus a one-click
LinkedIn add.

**On completion (all 14 modules + Oath signed):**
1. **Mint a credential** — server generates a unique `certId`, records
   `{name, rank, insurgentIndex, completedAt, certId}` (see §10), and publishes a
   public verification page at `/verify/[certId]`.
2. **Generate the badge image** — a dynamic, on-brand credential card rendered
   server-side (Satori / `@vercel/og` or node-canvas): the INSURGENT "Insurgent's
   Field Badge" with the user's name/handle, **rank**, **Insurgent Index**,
   completion date, `certId`, a QR to the verification page, and the
   `ONLY THE WEIRD SURVIVES` motif. This is the "auto-generated badge."
3. **Add to LinkedIn in one click** — a button using LinkedIn's **Add-to-Profile
   certification URL**:
   `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Digital%20Insurgency%20Field%20Course&organizationId=112670022&issueYear=YYYY&issueMonth=MM&certId=<certId>&certUrl=https://digital-insurgency.com/verify/<certId>`
   → LinkedIn opens the pre-filled "Licenses & certifications" dialog; the user
   confirms. Credential lives on their profile, verifiable via `certUrl`.
   - **Issuer:** ✅ the LinkedIn Company Page exists — **`organizationId=112670022`**
     (wired into the URL above). The issuer name shown on the profile is whatever
     that Page is titled; confirm it reads as intended ("Digital Insurgency" / "Space
     Pirate Zero") before launch.
4. **Open Badge from day one (decided).** Every credential is minted as a
   **verifiable Open Badge (2.0/3.0)** — a baked PNG + hosted assertion JSON with a
   cryptographic verification URL — so it's portable to Credly/Badgr/any Open Badge
   wallet, not just LinkedIn. The `/verify/[certId]` page *is* the hosted assertion.
   This raises the credential from "attestation" to "verifiable," which is on-brand
   (the site that teaches you to verify issues verifiable proof).
5. **Also offer:** download the badge PNG; a **"Share"** button that opens a
   pre-filled LinkedIn feed post (`.../sharing/share-offsite/` or a feed intent) with
   SPZ-voice copy + the badge image.

**Anti-fraud:** the badge is only mintable after server-side confirmation that the
14 module checkpoints + Oath are recorded for that identity; `/verify/[certId]`
shows what was actually completed and when. (Honesty is the brand.)

## 10. Tech architecture

**Recommended stack:**
- **Framework:** Next.js (App Router) + React + TypeScript. SSG/ISR for
  content/SEO; interactive islands for the Glass House; API routes for credential +
  badge-image + progress.
- **Styling/motion:** Tailwind wired to the INSURGENT design tokens; Framer Motion;
  a thin WebGL layer (react-three-fiber or raw canvas) for the portrait + GHOST.
- **Math:** KaTeX for equation rendering; the calculators are plain React + the
  canon formulas as typed functions (one module, unit-tested against the worked
  field reports in canon.md).
- **Identity/state:** **guest-first** — progress in `localStorage` with no account;
  at badge time, capture **email only** (magic-link or lightweight OTP) to name the
  credential and email the badge. Optional account later for cross-device sync.
- **Data:** GCP-native — **Cloud SQL (Postgres)** or **Firestore** (in `stylelift`)
  for credential records + (optional) synced progress. Content itself is static
  (built from `chapters/`, `canon.md`, `podcast/episodes.md`, `audiobook/`).
- **Badge image:** serverless render (Satori/`@vercel/og`) → PNG; stored in the
  existing GCS bucket (`spz-podcasts`/a new `spz-web` bucket).
- **Analytics:** **PostHog** (already in the SPZ stack — project Stylelift) for the
  module-completion **funnel**, exercise engagement, and badge conversion. Event the
  Mirror-Test pass rates to tune difficulty.
- **Hosting:** ✅ **Decided — Cloud Run + GCS** (GCP project `stylelift`), same
  footprint as the podcast (`spz-podcast-insurgency`) and the other SPZ sites.
  - Containerized **Next.js** on Cloud Run (standalone/`output: 'standalone'`,
    Dockerfile like `publishing/app/`), `--min-instances 1` to avoid cold starts on
    the interactive routes, `--allow-unauthenticated`, autoscale for launch spikes.
  - **GCS** (`spz-web` bucket or a `digital-insurgency/` prefix) for generated badge
    images, exported Canvas PDFs, and static art, served public + CDN cache-control.
  - Custom domain `digital-insurgency.com` mapped to the service (Cloud Run domain
    mapping or a GCLB in front); reuse the `deploy.sh` idempotent-deploy pattern.
  - Credential store: **Cloud SQL (Postgres)** or **Firestore** (GCP-native, keeps
    everything in `stylelift`) instead of an external Supabase/Neon.

**Content pipeline:** a build step transforms the repo's existing structured content
into the site's data — `chapters/*.md` → module prose; `canon.md` equation table →
typed calculator configs (formula + var defs + benchmarks); `podcast/episodes.md` →
module/episode metadata + Field Assignments; `chapters/ch_18.md` → the 8 Canvas
panels; Ep 13 → the 5 Oath commitments. **One source of truth (the book), many
surfaces.**

## 11. Accessibility, performance, SEO, privacy

- **A11y:** WCAG 2.2 AA. Contrast-audit the cyan/pink/amber on the void; full
  keyboard nav for every exercise; screen-reader labels for sliders/gauges/canvas;
  captions + transcripts for all audio; `prefers-reduced-motion` disables the heavy
  WebGL/scanlines with an equivalent static experience.
- **Performance:** SSG content, lazy-load the WebGL/interactive islands, image/art
  optimization, target Core Web Vitals green on mobile. The portrait/GHOST must not
  block first paint.
- **SEO:** per-module static pages, structured data (Book / Course / Podcast
  schema), per-page OG images (reuse the badge renderer), the `/verify` pages
  indexable for credibility.
- **Privacy (the brand demands it):** no third-party ad trackers; PostHog
  self/EU-config or cookieless mode; email stored only for credential + explicit
  opt-in for anything else; a plain-English privacy page. The site must pass its own
  Mirror Test.

## 12. Decisions to confirm (before build)

1. **Domain:** ✅ **Decided — `digital-insurgency.com`** is the canonical home for
   the whole experience (site + podcast landing). Still to do: register it + point
   DNS at the host. `/read`, `/listen`, `/glasshouse`, `/verify/[certId]` all live
   under this apex.
2. **Hosting:** ✅ **Decided — Cloud Run + GCS** (GCP `stylelift`, same footprint as
   the podcast). Containerized Next.js, `min-instances 1`, GCS for badge images /
   Canvas PDFs, GCP-native credential store (Cloud SQL/Firestore). See §10.
3. **Identity:** ✅ **Decided — guest + email-at-badge.** Progress in `localStorage`,
   no account to explore; capture email only at badge time (name the credential,
   email the badge, drive the LinkedIn add). Optional accounts/sync deferred to a
   later version. On-brand: the lowest-friction, least-extractive option.
4. **LinkedIn issuer:** ✅ **Decided — Company Page exists, `organizationId=112670022`**
   (wired into the add-to-profile URL in §9). Remaining: confirm the Page's public
   title reads as intended on the credential, and that it's published/verified.
5. **Audio timing:** ✅ **Decided — audio is LAST.** Build and launch everything
   text-first; the podcast player, section-score visuals, and read-along sync are the
   final phase, added only after the rest of the site (v1 + v1.1) is done and the 2E
   audio is produced. The `/listen` route + player are scaffolded but dark until then.
6. **Scope of v1:** ✅ **Decided — everything ships in v1** (no v1.1 hold-back). The
   complete loop **plus every killer feature**: **Claude-backed GHOST + the Boss-Fight
   simulator**, the **full Infiltration Canvas + PDF export**, the **BYO-URL Mirror
   Test → Teardown Cards**, the **WebGL healing portrait + GHOST**, all Tier-2
   delighters and Tier-3 growth mechanics, plus the anti-features (no dark patterns,
   transparency panel). See [IDEAS.md](IDEAS.md) for the full menu — all of it is v1.
   **Only audio is out of v1** (it's the last phase, per §12.5).
   - *Trade-off (noted):* one big v1 means a later first launch and more launch-blocking
     surface (WebGL, the Claude-backed GHOST, the Boss-Fight, real-app teardowns) than
     a loop-first cut. Accepted — build the whole thing, launch when it's whole.
7. **Credential rigor:** ✅ **Decided — verifiable Open Badge from day one** (see §9).
   Baked PNG + hosted assertion at `/verify/[certId]`, portable beyond LinkedIn.

## 13. Build roadmap (phased)

- **Phase 0 — Foundations (S/M):** Next.js scaffold; port INSURGENT tokens/fonts to
  web; content pipeline (chapters/canon/episodes → typed JSON); IA + routing; the
  design-system component kit (banners, eqbox, buttons, GHOST shell).
- **Phase 1 — The Book, beautifully (M):** `/read` all 14 modules, KaTeX equations,
  art, responsive, SEO, `/about` + buy links. *Shippable MVP: the field course, read.*
- **Phase 2 — The Glass House (L):** the 24 physics calculators (canon-driven +
  unit-tested), the Mirror Test engine (flip/tag/pass-fail + REAPER fail state), the
  14 Field Assignments, the **full Infiltration Canvas board + PDF export**, the
  **"only the weird" spotting game**, local progress. *The interactive heart.*
- **Phase 3 — GHOST live + the Boss Fight (L):** the **Claude-backed GHOST** guide
  (explains equations in context, reviews Field Assignment answers, in-character),
  and the **Boss-Fight pitch simulator** vs. each module's boss archetype (psychology-
  driven, PRISM buzzword rejection). *The killers that make it teach.*
- **Phase 4 — Identity & Credential (M):** email-at-badge + dossier, the rank engine
  + Insurgent Index (radar), the **WebGL healing portrait + GHOST**, the Oath
  ceremony, badge auto-generation, **verifiable Open Badge (day one)**, LinkedIn
  add-to-profile (`organizationId=112670022`) + share, `/verify/[certId]`.
  *The payoff loop closes.*
- **Phase 5 — Teardowns, Growth & Launch (L):** the **BYO-URL Mirror Test → shareable
  Teardown Cards** (viral engine), embeddable calculators + Mirror-Test widget, the
  opt-in Wall of Insurgents, personalized SPZ send-off, the radical-transparency
  panel, SEO/teardown content; motion polish + full a11y/perf hardening (WCAG 2.2 AA,
  Core Web Vitals) + PostHog funnels. **Launch v1 — everything except audio.**
- **Phase 6 — Audio (LAST):** the podcast player, section-score visuals, and
  read-along sync — added only after everything above is done **and** the 2E audio is
  produced. `/listen` is scaffolded-but-dark until this phase.

Sizing is T-shirt (S/M/L), not estimates. **Phases 0–5 = v1** (the whole experience —
every killer feature — launched text-only); **Phase 6 = audio, last.** This is a
bigger, later v1 than a loop-first cut (accepted per §12.6): build it whole, launch
it whole.

## 14. Why this will be world-class (and not just pretty)

- The interactive content **already exists, structured** (24 benchmarked equations,
  8 Canvas panels, 14 assignments, 5 Oath lines) — rare for an interactive book.
- The book's **thesis is inherently visual** (the healing portrait, flip-to-see-the-
  engine) — the medium *is* the message.
- The **credential loop** gives professional users a concrete reason to finish and
  share — organic distribution built into the payoff.
- The site **practices the ethics it teaches** (no dark patterns, radical
  transparency, real verification) — which is itself the most persuasive Mirror Test
  a reader can take.
