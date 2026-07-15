# Memory — autonovel (append-only log)

## 2026-06-04 — Digital Insurgency setup
- Created branch `autonovel/digital-insurgency`.
- Hand-authored the foundation from the seed bible: world.md, characters.md,
  outline.md (Prologue + 16 ch + appendices, `### Ch N:` headers), voice.md
  (Part 1 preserved; Part 2 = SPZ voice), canon.md (24 equations + hard facts).
- Added NEW `influences.md` (20 real figures) and wired it into draft_chapter.py
  (loads influences.md + seed.txt; retargeted from the fantasy book; system
  prompt + body rewritten for the spec-ops chapter format; BOOK_TITLE env added).
- Wrote seed.txt (master brief + Chapter Format Template).
- Chapters: ch_00-03 scaffolds (Prologue+Ch1-3, originals in external .docx);
  ch_04, ch_05 full v0 drafts imported; ch_06-16 scaffolds (v0 prose importable).
- state.json: phase=drafting, total=16, drafted=0, with run-path notes.
- .env created from example (gitignored); ANTHROPIC_API_KEY still a placeholder —
  user to add from console.anthropic.com.
- Bootstrapped this .wolf/ directory (did not exist before).

## 2026-06-04 — Pipeline run attempt (blocked on billing)
- API key added to .env (gitignored). Smoke test: key AUTHENTICATES; models
  claude-sonnet-4-6 and claude-opus-4-8 both VALID. Set REVIEW model to
  claude-opus-4-8 (was claude-opus-4-6, unconfirmed).
- BLOCKER: account has zero API credit ("credit balance is too low"). Pipeline
  not launched. User must add credits at console.anthropic.com/settings/billing.
- Run command when unblocked: `uv run python run_pipeline.py` (resumes at
  phase=drafting -> drafting/revision/export; skips foundation). Drafting loop is
  ch_01..ch_16; Prologue ch_00 is front matter, drafted separately.

## 2026-06-05 — Pipeline COMPLETE
- Switched all models to claude-opus-4-8 (env + every hardcoded default).
- Fixed Opus-incompatible 'temperature' param (logged in buglog.json).
- Full autonomous run: drafting (16 ch, some 2-5 attempts to clear 6.0 gate) ->
  3 revision cycles (plateau at novel_score 7.0) -> 4 Opus review rounds
  (which rewrote the Prologue ch_00 from scaffold into finished prose) -> export.
- RESULT: Prologue + 16 chapters, 58,070 words, novel_score 7.0, ~1.9 hrs.
  manuscript.md (58,086 w) built. No PDF (tectonic not installed).
- NOT done (optional/separate): Appendices A-C; art (needs FAL_KEY); audiobook
  (needs ELEVENLABS_API_KEY); PDF (needs `brew install tectonic`).

## 2026-06-05 — Appendices + PDF
- Authored Appendices A (24-equation cheatsheet), B (Infiltration Canvas), C
  (companion-app spec) directly -> chapters/ch_17,18,19.md.
- PDF: repo typeset/build_tex.py is prose-only (escapes $, breaks math/tables)
  AND has hardcoded /home/jeffq paths. Used pandoc + tectonic instead via new
  build_pdf.py (emoji/unicode -> safe text, strips [IMG] markers).
- RESULT: build/Digital_Insurgency.pdf — 154 pages, ~577KB, 61,120 words
  (Prologue + 16 ch + 3 appendices). *.pdf is gitignored so the PDF is local only.

## 2026-06-05 — INSURGENT design system PDF
- Built custom XeLaTeX/tectonic design: void #030303 pages, Orbitron (display),
  Space Grotesk (body), JetBrains Mono (code), pink chapter titles, cyan math,
  color-coded section banners (SITREP red, BROADCAST/MIRROR pink, BOSS amber,
  KEY MISSION acid, SPZ orange, GLOSSARY/BRIEFING cyan), colored GREEN/YELLOW/RED
  benchmarks. Files: fonts/ (OFL TTFs), design/{preamble.tex,sections.lua,cover.tex},
  build_design_pdf.py.
- Gotchas fixed: global \defaultfontfeatures{Path} hijacked the math-font lookup
  (use per-font Path=); \RaggedRight needs ragged2e (used \raggedright).
- OUTPUT: build/Digital_Insurgency_Designed.pdf — 146 pages, ~600KB. Verified by
  rendering pages with pdftoppm. (*.pdf gitignored -> local only.)
- Two PDFs now: build_pdf.py (plain/light) and build_design_pdf.py (INSURGENT).

## 2026-06-05 — Polish pass (net +1 to 8.0) + companion-app removal
- Removed companion app: deleted Appendix C (ch_19) + scrubbed all refs (pillars
  3->2, world/outline/seed/ch_16 end marker).
- Polish pass (run_pipeline --phase revision, appendices held out): cycle 4 lifted
  novel_score 7.0->8.0; cycle 5 regressed to 7.0 and apply_cuts DAMAGED ch_16
  (see buglog). Resolution: reset prose to cycle-4 peak (7c9a2f8, 8.0), hand-repaired
  ch_16, restored appendices, precise damage scan = 0 flags.
- FINAL: Prologue + 16 ch + Appendices A,B; 59,166 words; novel_score 8.0.
  Rebuilt all 3: build/Digital_Insurgency.pdf (plain), _Designed.pdf (INSURGENT),
  .epub. All gitignored (local).

## 2026-06-05 — Concise TOC + cover date 2026
- TOC: now chapters-only. Mechanism: sections.lua tags every non-banner heading
  {.unnumbered .unlisted} so pandoc emits \section* with no \addcontentsline ->
  only \dichapter chapter lines reach the .toc. cover.tex uses \@starttoc{toc}
  (not \tableofcontents) so the CONTENTS header + list sit on one page.
  Dead-ends learned: lowering tocdepth (0/1) blanks chapters in this class
  (l@chapter renders only at tocdepth>=2); \l@section/\l@subsection no-op override
  breaks chapter rendering too. Don't use those.
- Cover/publication date 2027 -> 2026 in design/cover.tex, build_pdf.py YAML,
  build_epub.py metadata (prose stays 2027 = in-story year).
- Rebuilt all 3 (plain PDF, designed PDF, epub).

## 2026-06-05 — Equations: real LaTeX + boxed
- Problem: most equations were plain **bold ASCII** (e.g. **F_g = (Sunk_Cost × ...)**),
  rendered as weak bold text, not math.
- convert_equations.py: replaced 32 bold/Formula equation DEFINITION lines across
  chapters with canonical $$ LaTeX (dict keyed by symbol; conservative — single '=',
  RHS starts with var/'(' not a number, so numeric field reports + glossary mentions
  are untouched). Now ~59 $$ display-math lines total (incl. Appendix A's 24).
- Stand-out treatment: design \eqbox (cyan \fcolorbox on panel bg) + sections.lua
  Para handler wraps any single-DisplayMath para in it. epub.css boxes
  math[display="block"] (pandoc --mathml emits that, no .math.display class).
  Plain PDF: real centered LaTeX (unboxed, minimal variant).
- Verified by rendering p18 (F_g, E_tax boxed fractions, cyan). Rebuilt all 3.

## 2026-06-05 — KDP (Amazon) publishing package
- Cannot upload for the user (KDP is a manual, login-gated portal; no public API).
  Prepared every asset + a step-by-step in kdp/KDP_UPLOAD.md.
- Kindle eBook: build_epub.py --kindle -> Digital_Insurgency_Kindle.epub
  (epub_kindle.css = light/reader-friendly, no forced dark bg; banners as
  left-border dividers; light equation boxes). epubcheck: 0 errors/warnings.
- eBook cover: build/cover_ebook.jpg 1600x2560 RGB (pdftoppm cover page + sips
  resample + pad with void #030303 -> seamless).
- Paperback: build_print_pdf.py -> 6x9 black-ink interior, 198pp, mirror margins
  (inner .75 outer .5), embedded+subset fonts (pdffonts emb=yes), monochrome
  design (black banner bars white text, framed eqs, bold B&W benchmarks).
  preamble_print.tex + cover_print.tex (light title/copyright/contents).
- Paperback cover wrap: build_paperback_cover.py -> 12.696x9.25in, spine 0.446in
  (198 x 0.002252 white). Auto-recomputes from interior page count.
- Metadata: kdp/kdp_metadata.md (title/subtitle/desc HTML/7 keywords/3 cats/price).
- Dark Designed.pdf stays screen-only (NOT for KDP print). build/*.jpg,*.txt,*.tex
  gitignored.

## 2026-06-05 — KDP paperback fix (margins/gutter)
- KDP rejected paperback: text outside margins / insufficient gutter. Cause:
  6 equations were trapped inside ``` code fences (convert_equations.py didn't
  track fence state) -> literal $$ ran off the page. Unwrapped via inline script;
  eqbox now adjustbox max-width scales wide eqs (Score). Print preamble hardened
  (fvextra, ragged heads, small tables, emergencystretch, hidelinks). 0 overfull.
- Re-uploadable: interior = build/Digital_Insurgency_Paperback_6x9.pdf (198pp,
  unchanged count so the existing cover wrap still matches). All formats rebuilt.

## 2026-06-05 — Substack reformatted as cyberpunk FABLES (all 30)
- User changed format: each post is a longer FABLE set in ZERO's 2027 world,
  ties to the book, shows the equation in LaTeX, ends "The moral of the story is..."
  + read-the-book CTA. (Branch note: work belongs on autonovel/digital-insurgency;
  the-last-human-ceo is a separate empty branch — don't commit DI work there.)
- substack/fables/day_01..30.md = 30 authored cyberpunk fables (ZERO/GHOST/BISHOP/
  Sarah/Iron Mike/Dr Vance/SIGNAL), each ending `MORAL: ...`.
- build_posts.py v2 assembles: buy bar -> card -> fable -> "What it means" (nugget)
  -> equation ($$) -> "The moral of the story is" -> CTA. Verified via preview.
- Still pending: live Substack push needs auth (cookies; email/pw 403'd = magic-link
  account). push_substack.py ready; reads .env.

## 2E "Recording Edition" — podcast setup (2026-07-15)
- Prepped Digital Insurgency for a 2nd Edition = a 14-episode AUDIO FIELD COURSE
  (the "Defense Against the Dark Arts" episodic-podcast pattern). NO AUDIO YET.
- Worktree branch was based on stale PRE-monorepo history; hard-reset onto `master`
  to get the real `books/` monorepo (all 4 books). Worked in place in books/digital-insurgency/.
- The book already has the perfect episodic spine: each chapter = BROADCAST (scene)
  -> LESSON (equations + field reports) -> SPZ CLOSER -> "Next:" hook. 2E formalizes it.
- Built: 2ND_EDITION.md (charter), podcast/{episodes.md,config.json,README.md},
  audiobook/{README.md,audiobook_voices.json,scripts/,intros/,produced/}, REVISION_MAP_2E.md,
  updated state.json (edition=2, phase=2e_podcast_setup) + .wolf/anatomy.md.
- ep_01.md written by hand as the LOCKED reference script (Orientation/Mirror Test,
  from the Prologue + Five Claims). ep_02-14 scripts + 14 intros drafted by 4 parallel
  subagents against that template — REVIEW those first-pass drafts before recording.
- Standalone SPZ-network show: service spz-podcast-insurgency, bucket spz-podcasts,
  prefix digital-insurgency. Publishes via repo-root publishing/ (cp config.json -> publishing/).
- NOTE on the "Defense" reference: the real book "Defense Against the Dark Arts:
  A Field Course for the Zero-Trust Reality" (14 eps = Prologue + 13 modules; live
  feed spz-podcast-defense) lives on WORKTREE BRANCH spz/zero-trust-research-analysis-24ce8e,
  NOT on master. On master, books/zero-trust-reality/ is a stale TLHC duplicate.
  Defense's pattern: fixed per-module anatomy, per-episode host-intros, config-driven
  publish (publishing/config.<slug>.json), separate Cloud Run service/prefix. DI 2E
  mirrors this with DI's own native spine (BROADCAST->LESSON->SPZ CLOSER).

## 2E scripts drafted + section score (2026-07-15, cont.)
- All 14 recording scripts drafted: ep_01 hand-written (locked reference), ep_02-14
  by 4 parallel subagents against it. QA: banned-word clean, ~2.1k-4.2k spoken words
  each (ep_12 three-dispatch longest, ep_09 merged Ch9-10 next). FIRST-PASS — review before recording.
- Section SCORE (sonic signposting) added so listeners hear each new section:
  audiobook/SCORE.md (design: palette, per-section cue table, transition rules, asset list)
  + audiobook/apply_score.py (idempotent stamper: inserts `> ♪ **SCORE — LABEL** ...`
  blockquote under every `## [SECTION]` header; prefix-mapped incl. DISPATCH/BRIEFING;
  `--check` = CI gate). 87 sections scored across all 14 scripts. Cues are mix markers,
  NOT read aloud. Re-run apply_score.py after any script edit. Audio still deferred.
- Nothing committed yet (working tree on branch spz/digital-insurgency-2nd-edition-09052d).

## 2E website experience — PLAN (2026-07-15)
- website/PLAN.md: complete blueprint (PLAN ONLY, nothing built) for a world-class
  interactive companion site "the Glass House". User reads/listens the 14-module field
  course + runs every exercise graphically (Mirror Tests = flip-the-product/find-the-rot;
  24 physics calculators from canon.md benchmarks; 14 Field Assignments; the 8-panel
  Infiltration Canvas from Appendix B; the Insurgent's Oath) → healing Dorian-Gray portrait
  + rank ladder (Decorator→Wedge→Curator→Insurgent→Ghost) + Insurgent Index → auto-generated
  LinkedIn credential (mint certId + dynamic badge image + one-click LinkedIn add-to-profile
  cert URL + /verify page + Open Badge). Cast as UI: GHOST=guide, REAPER=fail state, portrait=progress.
- Stack rec: Next.js/TS, INSURGENT design tokens (design/ + fonts/), KaTeX, PostHog analytics
  (already in SPZ stack), Cloud Run+GCS (or Vercel), guest-first + email-at-badge.
- Big head start: interactive content already structured in repo (canon 24 eqs w/ benchmarks,
  ch_18 8 Canvas panels, episodes.md 14 assignments, Ep13 5 Oath lines).
- DECISIONS TO CONFIRM before build (PLAN §12): domain (digitalinsurgency.show?), hosting,
  identity model, LinkedIn Company Page + organizationId (REQUIRED for 1-click add), audio timing, v1 scope.

## Domain decided (2026-07-15)
- Canonical domain for the Digital Insurgency experience (website + podcast landing)
  = digital-insurgency.com. Updated podcast/config.json public_url, podcast/README.md,
  website/PLAN.md (§12.1 resolved + LinkedIn certUrl example). Still to do: register
  the domain + point DNS at the host (Cloud Run/Vercel, TBD).

## LinkedIn issuer decided (2026-07-15)
- LinkedIn Company Page exists for the badge issuer: organizationId=112670022.
  Wired into website/PLAN.md §9 add-to-profile cert URL + §12.4 marked decided.
  TODO before launch: confirm the Page's public title reads as intended on the credential.

## Hosting decided (2026-07-15)
- Website hosting = Cloud Run + GCS on GCP project stylelift (same footprint as the
  spz-podcast-insurgency service). Containerized Next.js (min-instances 1), GCS for
  badge images/Canvas PDFs, GCP-native credential store (Cloud SQL/Firestore),
  digital-insurgency.com mapped to the service. PLAN.md §10 + §12.2 updated.

## Identity decided + killer-features brainstorm + v1 scope rec (2026-07-15)
- Identity = guest + email-at-badge (localStorage progress; email only at badge time). PLAN §12.3.
- website/IDEAS.md: killer-features brainstorm. Tier-1 killers: (1) GHOST as real
  Claude-backed guide, (2) Boss-Fight pitch simulator vs boss archetypes, (3) BYO-URL
  Mirror Test → shareable Teardown Cards (viral), (4) Insurgent Index score on résumé,
  (5) personalized "your" healing portrait, (6) business-case PDF generator (real work artifact).
  Plus anti-features: no streaks/dark patterns, radical-transparency panel.
- v1 scope RECOMMENDED (confirm): complete loop = read + 24 calculators + Mirror Tests
  + 2D/SVG healing portrait + the Oath (KEEP, cheap gate) + Insurgent Index + badge +
  LinkedIn + /verify, GHOST scripted. Defer to v1.1: full Infiltration Canvas+PDF,
  Claude-backed GHOST + Boss-Fight, BYO-URL Mirror Test/Teardown, WebGL portrait,
  audio read-along, accounts/sync. PLAN §12.6 + phases.

## Credential + audio timing decided (2026-07-15)
- Credential rigor = verifiable Open Badge (2.0/3.0) from DAY ONE (baked PNG + hosted
  assertion at /verify/[certId], portable beyond LinkedIn). PLAN §9 + §12.7.
- Audio timing = LAST. Build/launch everything text-first; podcast player + section-score
  visuals + read-along are the final phase (Phase 6), after v1+v1.1 and once 2E audio is
  produced. /listen scaffolded-but-dark until then. PLAN §12.5.
- Roadmap reordered: Phases 0-4 = v1 (text-only complete loop, launch), Phase 5 = v1.1
  growth killers (Claude GHOST, Boss-Fight, full Canvas+PDF, BYO-URL teardowns, WebGL),
  Phase 6 = audio last. All §12 decisions now resolved except nothing — plan is build-ready.

## v1 scope changed: EVERYTHING in v1 (2026-07-15)
- User decision: add ALL ideas to v1 — no v1.1 hold-back. v1 now = complete loop +
  every killer (Claude-backed GHOST, Boss-Fight simulator, full Infiltration Canvas+PDF,
  BYO-URL Mirror Test→Teardown Cards, WebGL portrait) + all Tier-2/3 + anti-features.
  Only AUDIO stays out of v1 (final phase). PLAN §12.6 + roadmap + IDEAS.md updated.
- Roadmap now: Phase 0 Foundations, 1 the Book, 2 Glass House (calcs+mirror+full Canvas),
  3 GHOST live + Boss Fight, 4 Identity & Credential (WebGL portrait, Oath, Open Badge,
  LinkedIn), 5 Teardowns/Growth/Launch, 6 Audio LAST. Phases 0-5 = v1. Trade-off (bigger/later
  launch) noted+accepted.

## Spaceship Alpha 9 art series generated (2026-07-15)
- 15 "Spaceship Alpha 9" saucer images, one per major DI moment, in art/spaceships/
  (01_mirror-test … 15_insurgents-oath.png). House style locked in art/spaceships/
  gen_spaceships.py (STYLE const) + per-scene prompts in prompts.json.
- Backend: GEMINI Nano Banana (gemini-2.5-flash-image). FAL_KEY is NOT provisioned
  (load-secrets.sh note: placeholder, not in Secret Manager). GEMINI_API_KEY IS in
  Secret Manager (project stylelift); pull via:
  export GEMINI_API_KEY=$(gcloud secrets versions access latest --secret=GEMINI_API_KEY --project=stylelift)
  then: python3 art/spaceships/gen_spaceships.py [--only N|--from N|--list]
- GHOST rendered as cyan mesh entity + REAPER as red wireframe environment (canon HARD
  RULES) both correct. Minor AI-gen garbled micro-text on some (e.g. scene 14 billboard
  "WEIRD" dropped) — regenerate individual scenes with --only N if needed.

## Website build STARTED — running foundation (2026-07-15)
- Real Next.js 15 app at books/digital-insurgency/website/ (App Router, TS, Tailwind,
  INSURGENT tokens, vendored fonts, next/font/local). RUNS: pnpm dev on :4311 (launch.json
  in worktree .claude points --dir at the absolute website path).
- Content pipeline (scripts/build-content.mjs, runs pre-dev/build): parses canon.md 24-eq
  table + podcast/config.json 14 modules → content/{equations,modules,show}.json. Single
  source of truth = the book.
- Pages LIVE: / (hero art + 5 claims + module grid + credential CTA), /read (module index),
  /read/[slug] (loads REAL chapter prose via lib/chapters.ts EP_TO_FILES), /glasshouse
  (6 interactive calculators from lib/calculators.ts + full 24-eq table + Mirror Test entry),
  /glasshouse/mirror-test (interactive flip→tag→pass/fail, GHOST pass / REAPER fail),
  /badge (credential showcase + LinkedIn add-to-profile org 112670022 + portrait heal).
- Art wired into public/art/{spaceships,site}. Gotcha fixed: server component can't pass
  fn props to client comp → wrapped calculators in components/Calculators.tsx ("use client").
- NOT yet built (remaining phases): all 24 calculators, 14 Mirror Tests, full Canvas + PDF,
  Oath ceremony, Claude-backed GHOST, Boss-Fight sim, WebGL portrait, badge MINTING +
  Open Badge + /verify, email-at-badge, PostHog, Cloud Run deploy. Audio: sample render pending.
- NB: all work is in the MAIN repo tree (/Users/gregchambers/autonovel/books/digital-insurgency),
  not the worktree; nothing committed yet.

## Big build push — completion loop + audio + graphics + animations (2026-07-15)
- Audiobook SAMPLE rendered: audiobook/produced/ep_01_SAMPLE.mp3 — 9m27s, 8.7MB, MULTI-VOICE
  (NARRATOR/SPZ custom voice 8bOIcU4hJx9LYJV4NS1I + ZERO=Sarah EXAVITQu4vr4xnSDxMaL, real IDs now
  in audiobook_voices.json). Wired into site (public/audio + AudioPlayer on Ep 01 read page).
  Render via ElevenLabs (key in Secret Manager). Full 14-ep render still pending.
- 12 more Gemini emblems generated (art/site-assets/extra → public/art/extra): 5 rank badges
  (Decorator→Ghost), 5 module crests, ghost-avatar + reaper-sigil.
- Micro-animations added (framer-motion + CSS): template.tsx page transitions, hover-lift/tap,
  stagger, gauge needle, scanline, neon flicker, float, button sheen, oath check-in, portrait
  crossfade, progress bars. globals.css keyframes + components/motion.tsx.
- COMPLETION LOOP built + VERIFIED end-to-end in browser: lib/progress.ts (localStorage store,
  rank ladder Decorator→Wedge→Curator→Insurgent→Ghost, Insurgent Index 0-100), ModuleComplete
  toggle on reader, /glasshouse/oath (5-commitment ceremony), MintPanel (gated 0/14 → complete →
  generate badge w/ name+rank+index overlay), lib/cred.ts (base64url self-describing token),
  /verify/[certId] (decodes+displays credential), /dossier (rank + portrait heal + checklist),
  LinkedIn add-to-profile org 112670022 with certId+certUrl. Tested: complete→mint→/verify shows
  "VERIFIED CREDENTIAL Greg Chambers · Insurgent · Index 100". Course is completable end-to-end.
- Gotcha (fixed): server comps can't pass fn props to client comps → Calculators.tsx client wrapper.
- STILL TODO: Claude-backed GHOST, Boss-Fight sim, full Infiltration Canvas+PDF, all 24 calcs + 14
  Mirror Tests, SERVER-SIDE Open Badge mint + DB (current token is client-side v1, not tamper-proof),
  PostHog, Cloud Run deploy, full 14-ep audiobook render. Dev server: pnpm dev :4311.
