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

## 2026-07-07 — Consolidated all books into books/ monorepo
- master reshaped: framework-on-master + per-book branches -> monorepo. Each book
  a self-contained folder under books/: digital-insurgency (relocated from root via
  git renames), the-last-human-ceo, zero-trust-reality (from their autonovel/* branches),
  neko-death-cult (was untracked worktree work — nearly lost; found before pruning).
- Method: `git read-tree --prefix=books/<name>/ <branch>`; verified each subtree
  byte-identical via `git diff <branch> HEAD:books/<name>` (empty). Commit 1fd7de3.
- Root trimmed to shared config only (.env.example, pyproject.toml, uv.lock,
  .python-version, .wolf, README). Rewrote README + anatomy.md for new layout.
- Pruned spz/* worktrees + branches. Kept autonovel/* branches as archives.
  Excluded autonovel/bells per user. NOT pushed (local only).

## 2026-07-07 — Eps 1–7 all produced (credits restored; worktree=mystifying-hertz on master)
Note: the nifty-kilby worktree was deleted; work survived on master (books/neko-death-cult).
Active worktree now .claude/worktrees/mystifying-hertz-fe888c (branch master).
- Batch-rendered Eps 5,6,7 end-to-end (record→samples→song(music.compose)→open→assemble→layer):
  ep05_FINAL 26.6m, ep06_FINAL 27.1m, ep07_FINAL 24.2m (Ep7 stripped 4-bed). Songs track05/06/07
  SAMPLED (Ep6/7 clean pockets; Ep5 vocal-dense so intro/mid have slight soft-vocal tail).
- Redid Eps 1,2,3 audiobooks with proper scene-bed scores + branded opens (NO re-record; reused
  ch_0N.voice.mp3). Ep1 already had scene cues; rewrote Ep2 & Ep3 descriptive MUSIC cues to
  bed keywords (COSMIC→CATHEDRAL→EUROPA→MOTEL→THEME→OUTRO). Built standardized ep0N_open (sting→
  theme→SPZ identifier VO "This is episode N, the door marked X") for all three. ep01_FINAL 30.2m,
  ep02_FINAL 28.4m, ep03_FINAL 27.7m. All ep0N_FINAL.mp3 + sampled songs copied to ~/Downloads.
- Open-build gotcha (ffmpeg 8.1): build stages as separate single-output files, final amix/acrossfade
  reads RAW input files with -map "[ob]" (see buglog). assemble.py bed_for matches keywords in cue text.

## 2026-07-07 (cont) — Ep8 finale done → SEASON ONE (Eps 1-8) COMPLETE
- Ep8 "The Anna Nicole Door" (Florida '07 attention-age finale, the Fog lifts; Kat=news anchor
  on 40 screens): expanded ch_08 to ~26min w/ 6 scene beds; album TRACK 8 "Forty Screens" (2007
  tabloid-glare × industrial-goth). Full pipeline → ep08_FINAL 26.2min + track08 SAMPLED. All Downloads.
- Pushed local master → NEW branch spz/neko-death-cult (spz=digital-insurgency repo; spz/master
  had diverged 66/69 w/ its own Substack history, so used a new branch to avoid clobbering it).
- Season One "The Fog" (Eps 1-8) all produced: branded open + scene scoring + album song + samples.
- Ep8 NOT yet committed (prior batch committed as 188881d). Act Two = Eps 9-24 (Ep9 = Cobain/Seattle).

## 2026-07-07 (cont) — Act Two underway (Eps 9-12 produced)
Rolling Act Two ("The Mastery") one full episode per pass (write→record→song→samples→open→
assemble→layer). Done: Ep9 Cobain "Hold Me While I Flicker" (the Seattle flicker payoff; SPZ's
first deliberate landing) 24.3m; Ep10 Elvis "Caught in a Trap" (tribute-act-of-yourself beige;
reaching costs Kat) 25.9m; Ep11 Whitney "One Floor Up" (the wake-not-a-party; the discipline of
NOT reaching — "who pays if it goes wrong?") 25.2m; Ep12 Europa/reveal "Count the Doors" (LOAD-
BEARING: SPZ parked at the Europa, bearded man finally speaks cryptically, Door-2 note lands, SPZ
counts and finds his own name on a 25th door — he's Door Zero; sealed door now heavier) 22.7m.
- GOTCHA: ElevenLabs Music blocks prompts NAMING real artists (Elvis etc.) → describe era/sound
  generically, no names. Audiobook TTS unaffected. Logged to buglog would be good.
- GOTCHA: don't background record.py with `&` inside a run_in_background bash — it orphans and
  the harness won't notify. Launch as a plain run_in_background command.
- Next: Ep13 Lenny Bruce, Ep14 Sid Vicious, Ep15 Heath Ledger, Ep16 Amy Winehouse (Act II close,
  Door-16 = Kat's "one more jump and I'm gone" confession per characters.md). Then Act III 17-24.

## 2026-07-07 (cont) — SEASON TWO "The Mastery" (Eps 9-16) COMPLETE
Act II fully produced. New this batch: Ep13 Lenny Bruce "Held in Contempt" (invoice-don't-ban;
the modern censorship is attrition) 23.8m; Ep14 Sid Vicious "Cash from Chaos" (manufactured
rebellion; SPZ's own punk jacket came off the same rail) 24.6m; Ep15 Heath Ledger "The Mask Eats
the Man" (disappear-into-the-role = Kat dissolving into signal; she asks him not to follow) 24.2m;
Ep16 Amy Winehouse "One Jump Left" (LOAD-BEARING Act II finale: 27-club = scheduled shelf-life;
Kat's CONFESSION — one jump left, spent dying in his arms in Seattle; forbids the sealed-door
shortcut; extracts the Act III promise = SURVIVE ME, don't go dark. That promise is why the show exists).
- GOTCHA (logged): never put a foreign bed-keyword (e.g. "dread") in a DIFFERENT bed's cue text —
  assemble.py bed_for() matches BEDMAP order (vault,cathedral,motel,dread,cosmic,europa,outro,theme),
  so "EUROPA — ... dread" wrongly maps to motel. Fixed ch_13 (dread→rain).
- Credits: user reports 435k remaining (plenty; ~15 eps). Stopped watching for refusals.
- ACT III (17-24) SCOUTED but NOT requested (user said "act 2"). Plan: 17 MJ (rewind fails),
  18 Hunter S Thompson (sealed-door temptation peaks), 19 Davos (LOAD-BEARING: Cult takes contracts
  from the system — beige's quality control, not cure; first recipe he authors), 20 Dubai (refuses a
  reap), 21 GG Allin (nihilism out/punk in; turn to the light), 22 River Phoenix (beige hereditary;
  Kat's last solid night), 23 Sealed Door (LOAD-BEARING), 24 Door Zero (LOAD-BEARING finale: refusal;
  he becomes the whisper toward signal; dawn at Europa; mirrors Door 1).

## 2026-07-07 (cont) — Act III "The Refusal" underway (Eps 17-19 done)
Ep17 Michael Jackson "You Can't Rewind" (SPZ tries to rewind to a younger Kat, tears the calendar
onto nothing, slams into never-rewind; the nostalgia/comeback economy; first refusal) 25.5m.
Ep18 Hunter S Thompson "Buy the Ticket" (first gun-door opened on purpose; the sealed-door temptation
PEAKS — a shortcut to beat Kat to the dark — Kat forbids it: "his was an ending, yours would be an
exit"; disruptor kills the free press) 26.6m. Ep19 Davos "Quality Control" (LOAD-BEARING REVEAL: SPZ
authors his FIRST door — a nameless service-worker OD — to reach the WEF; discovers the Cult are a
FIRM, staff, subcontractors; the geniuses were CONTRACTS commissioned by the elite protecting portfolios;
the Cult = beige's QUALITY CONTROL; SPZ's own door has a buyer; a door that reads its contract and
declines to open is the machine's one unbuilt defense) 25.5m.
- Act III remaining: 20 Dubai (refuses a reap for the first time), 21 GG Allin (nihilism out/punk in,
  turn to the light), 22 River Phoenix (beige hereditary; Kat's LAST SOLID NIGHT), 23 Sealed Door
  (LOAD-BEARING: dissolve with Kat or stay solid & lose her), 24 Door Zero (LOAD-BEARING FINALE: the
  refusal — chooses forward, becomes the whisper toward signal, dawn at Europa, mirrors Door 1).

## 2026-07-07 (cont) — SERIES COMPLETE. All 24 doors produced. "The Maneki Neko Death Cult" done.
Act III finished: Ep20 Dubai "Nobody Gets Out" (first refusal of a reap) 26.5m; Ep21 GG Allin
"Signal and Its Merch" (nihilism out, turn to the light) 26.2m; Ep22 River Phoenix "Last Solid
Night" (beige hereditary; Kat's last solid night — pancakes) 26.0m; Ep23 THE SEALED DOOR "The Only
Way Is Through" (LOAD-BEARING CLIMAX: Kat's final flicker-out in the Seattle room; the sealed door
revealed as UNION-in-signal not oblivion — true, no lie — he refuses it for love, stays; the coat-
museum of relics converges) 26.9m; Ep24 DOOR ZERO "Signal Finds Signal" (LOAD-BEARING FINALE + album
title track: SPZ's own door, the managed-Atlanta-nobody; he rewrites his contract, becomes the
COUNTER-WHISPER — a reaper who whispers toward signal, the post the Cult never built; bearded man
relieved; dawn at Europa mirroring Door 1; the show revealed AS the counter-whisper to the listener)
26.9m, resolves warm to light not silence.
- ALL 24 ep0N_FINAL.mp3 (Eps 1-24) + track01-24 SAMPLED songs in ~/Downloads. Album "Signal Finds
  Signal" = 24 tracks written in album.md. Three acts: The Fog (1-8), The Mastery (9-16), The Refusal
  (17-24). Total ~10.5 hrs of produced scored audio drama + a 24-song companion album.

## SPZ Brand Kit — voices (saved 2026-07-07)
Saved the reusable SPZ voice identity to `brand/spz/` (repo, version-controlled) and
`~/.claude/brand/spz/` (global, cross-project). Hero voice NARRATOR = Space Pirate Zero,
ElevenLabs custom voice_id `8bOIcU4hJx9LYJV4NS1I`, model eleven_v3, settings
{stability 0.5, similarity_boost 0.85, style 0.35, speaker_boost, speed 1.08}. Full cast +
gotchas + Python snippet in `brand/spz/voices.json`. Source of truth stays
`books/neko-death-cult/tools/record.py`; the kit is a durable snapshot for reuse.

## SPZ Brand Kit — full (expanded 2026-07-07)
Expanded the SPZ brand kit from voices-only to a FULL kit at `brand/spz/` (repo) +
`~/.claude/brand/spz/` (global). Files: brand.json (manifest/index), verbal.md (voice
& tone, two gears, banned words, mantra "Signal finds signal"), voices.json (ElevenLabs
cast, hero NARRATOR=SPZ), palette.json (void #030303 / pink #FF1493 / cyan #00F0FF /
paper #E8E8E8 / muted #8A90A0), typography.json (Orbitron display / Space Grotesk body /
JetBrains Mono code / EB Garamond alt), sonic.json (industrial-goth ~70 BPM engine,
theme + logo sting + 6 scene beds + mix/mastering chain). All values extracted from the
real production system (cover/design scripts, fonts/, scoring.md, tools/), not invented.

## Songs redo — composition_plan, era-forward, sung duets (2026-07-08)
User: old 24 songs "start with static and sound the same/generic." Root cause: single prose
prompt + force_instrumental flattened every track to the shared industrial-goth denominator,
and the model prepended a quiet vinyl-crackle lead-in (the "static"). Fix = new
tools/compose_songs.py using ElevenLabs music.compose composition_plan (MusicPrompt): era
instruments woven into positive_global_styles AND every SongSection; negative_global_styles
bans ambient/static intros; downbeat "cold start" Intro; master = silenceremove head +
loudnorm I=-10 + alimiter; output 44100/192k. Two modes: --instrumental (7-section beat) and
default VOCAL (parses album.md lyrics into sung sections, keeps Intro/Breakdown/Outro
instrumental pockets for spoken samples). User chose SUNG VOCALS. Proved on doors 2/3/14
(Joplin/Pimp C/Sid) — hot from bar one, ~-10 LUFS, ~2min. Pending: batch all 24 on approval.

## Sid track fully produced (2026-07-08)
Door 14 "Cash from Chaos" delivered complete: era-forward '79 punk music + sung SPZ/Kat duet
(track14_cash-from-chaos_VOX.mp3) + door-14 spoken samples woven into instrumental pockets via
new tools/produce_song.py. The VOX take sings densely (~115s, only 2 vocal-free gaps), so the
producer builds a clean intro pocket from the demucs no_vocals stem and prepends it, giving
SPZ's thesis line ("the rebellion was the product all along") clean room up front; Kat "wear it
awake" sits clean in the mid gap; Kat "doubted the jacket" is pitched-down+reverbed as the
haunted outro. Master -9.6 LUFS. Output: audio/produced/ep14_song_FINAL.mp3 (+ ~/Downloads).
SAMPLE_ORDER override in produce_song.py fixes narrative order (else alphabetical).

## SPZ brand kit made CANONICAL (2026-07-08)
User: "Save this as THE one and only brand kit." The interactive brand/spz/brand_kit.html
(playable audio + live visualizers + microanimations) is now the definitive SPZ brand kit.
brand.json bumped to 1.1.0 with status=CANONICAL + canonical_deliverable (file + artifact URL
https://claude.ai/code/artifact/753aa02e-8d51-4f64-98e4-a9fe2bd46aa0). README crowns it. Rule:
edit build_brand_kit.py and redeploy to the SAME url; never fork variants. Saved to auto-memory
spz-brand-kit.md.

## Brand kit v1.2 — pulled real data from spacepiratezero.com (2026-07-08)
Read the live site and integrated real links + data into the canonical brand kit. New data files
links.json (site, taglines "Digital Insurgent at Large"/"No algorithms. No noise. Just shipping.",
operator = Greg Chambers/SA9/patents US11432994+US11600383, social, streaming, studio) and
catalog.json (6 released albums: Lambada on Saturn's Rings, Afternoon Delight, Vaudeville Nebula,
The Yellow 5, американское порно, Tentacle Love + Spotify/Apple). Board gained Catalog (07) and
Links (08) sections + operator card + tagline pills; nav now 8 items. Books show 0 published on
the site, so the monorepo books are framed as forthcoming. brand.json -> 1.2.0 with a web{} block.

## Brand kit v1.3 — pulled SA9 + StyleLift site data from the private repo (2026-07-08)
User: the spaceshipalpha9.co and stylelift.fashion sites aren't deployed to the web — read them
from the SpaceShipAlpha9 GitHub repo (gh, logged in as space-pirate-zero). Found sa9 marketing
site at website/ (name "sa9-website"; roster in website/src/lib/products.ts; 8-principle manifesto
in website/src/app/(main)/manifesto) and stylelift.fashion at sites/stylelift/. New studio.json
captures: SA9 = AI-native indie studio, 16-product roster (name/tagline/domain/status), manifesto,
Space Tokens + Keycloak SSO, 5 design systems (NEON/PHOSPHOR/LEOPARD/STEALTH/CATHODE), StyleLift
detail (512-dim Style DNA, Free/$9.99 Pro, 87% fit). Board gained Studio section (09); nav now 9.
SPZ is the FLAGSHIP brand of SA9 (Greg=Captain, w/ Daniela). brand.json -> 1.3.0. Note: the SPZ
site itself (spacepiratezero.com) also lives in the repo at apps/stylelift/apps/spz/.

## Brand kit v1.4 — Enterprise Consulting (Meijer + MOS) (2026-07-08)
Added an Enterprise Consulting section (the B2B facet) pulled from the space-pirate-zero/MOS repo.
MOS = "Marketing OS" — "Marketing intent in, governed execution out"; declarative MOSL docs = the
deployments, one durable Temporal runtime, MCP tool rails, compliance pinned by tests; built as the
substrate for MEIJER marketing (integrations/meijer-digitalapis: 215 ops / 10 Azure APIM APIs,
mPerks loyalty, Emarsys, consent/opt-out). New enterprise.json + board section 10 (capabilities
chips + two engagement cards Meijer/MOS + prior Coca-Cola + patents). nav now 10. brand.json 1.4.0.

## Brand kit v1.5 — Storytelling Studio + founders (2026-07-08)
Added a Storytelling Studio section (07): SA9 = the premier AI-based storytelling studio in the
South, producing original IP (The Last Human CEO, Signal Finds Signal, Neko Death Cult, Digital
Insurgency, Zero Trust Reality) + the two founders. Founder bios pulled from the SA9 repo
(src/components/sections/Bio.tsx): Greg Chambers (Co-Founder & CTO, "architects the intelligence",
25+ yrs, ex-Coca-Cola Global Group Director Digital Innovation, AI across 15,000 locations) and
Daniela Chambers (Co-Founder & CEO, "engineers the empathy", EMMY-NOMINATED editor/producer/visual
storyteller, 27+ yrs at CNN en Español, bilingual, national modeling career, AE/Premiere/Motion,
early GenAI adopter; danielachambers.com is a client-rendered SPA — header confirmed Emmy-nominated
+ CNN en Español). Ethos: "Storytelling isn't a support role. It's the mission." New
storytelling.json. Sections renumbered to 01-11; nav now 11 (added Story). brand.json 1.5.0.

## Signal Finds Signal — tracks 1-4 LOCKED (2026-07-08)
Resumed album production. User curated final versions in iCloud a+_neko/ and locked tracks 1-4.
Established canonical album masters folder at books/neko-death-cult/audio/album/ with numbered
locked masters (01_cold-heart-warm-hands, 02_indra, 03_slow-enough-to-stay, 04_weather-in-your-
hands) + ALBUM.md manifest tracking lock status for all 24. The locked files are byte-identical to
the original _SAMPLED versions in audio/songs/ (NOT the newer era-forward VOX/PRO redos — user
chose the original SAMPLED takes for the album). Rule: never regenerate/overwrite a LOCKED track.
Next: generate/produce tracks 5-24. Lyrics/style source = album.md; tools = compose_songs.py +
produce_song.py.

## 2026-07-11 — The Last Human CEO: multi-voice SPZ audiobook + theme/intro
Built the audiobook pipeline in books/the-last-human-ceo/: retargeted the stale
(fantasy) audiobook_voices.json + gen_audiobook_script.py CHARACTERS to the real
cast on the SPZ brand voices (SPZ narrates; Callum=Cope, Lily=Sun/Margaux/Viv,
Clarissa=the machine on v2, Blackwood=Frade/Tisch, George=Adler). New
render_audiobook.py = proven per-segment v3 TTS (drop-guard, real silence, ffmpeg
stitch), gen_theme.py = ElevenLabs Music API theme + ducked SPZ title-card intro,
produce_chapter.py = theme-wrapped chapter. Fixed opus-4-8 'temperature' 400 +
switched call_claude to streaming (ReadTimeout on long chapters); made parse+render
resume-safe; run long renders detached (nohup+disown) to survive session teardown.
Act 1 (slots 0-9) done: ch_00-09 rendered (~4.3h), theme.mp3, 00_intro.mp3,
produced/ch_01_PRODUCED.mp3. Pending: slots 10-29 + full assembly. See auto-memory
last-human-ceo-audiobook.md.

## 2026-07-13 — Repo-wide production standards + shared-universe canon
Consolidated all TLHC launch work into reusable, cross-book form:
- **`standards/`** (new): README (index + new-book launch checklist), AUDIOBOOK.md,
  PUBLISHING.md, SOCIAL.md, BRAND.md — the four pipelines, with
  `books/the-last-human-ceo/` + `publishing/` as the reference implementation.
- **`UNIVERSE.md`** (new): shared-reality canon. All books are *transmissions* from
  **Spaceship Alpha 9** (studio = in-fiction vessel), narrated by **Space Pirate
  Zero**. Transmission ledger (TLHC, Neko Death Cult, Digital Insurgency, Zero Trust
  Reality, Signal Finds Signal album), shared law (counterfeit vs honest; signal
  finds signal; machines are honest mirrors not villains; "beige"; cameos travel,
  plots don't), and an "add a new transmission" procedure.
- Linked both from top-level `README.md`; recorded in `.wolf/anatomy.md`.
- Social motion upgrade also shipped: glow-pulse audiograms, title-reveal trailer
  intro, 29 per-episode teaser Reels (`social/gen_teasers.py`), reproducible
  `social/make_presskit.sh` (press-kit.zip → GCS, git-ignored).

## 2026-07-15 — brand kit build made reproducible (dreamy-leakey worktree)
- `brand/spz/build_brand_kit.py` had hard-coded absolute paths: FONTS into the
  removed mystifying-hertz worktree, CLIPS/OUT into a wiped /private/tmp scratchpad.
- Repointed to repo-relative defaults resolved from `__file__` (FONTS=`<repo>/fonts`,
  CLIPS=`brand/spz/clips/`, OUT=`brand/spz/brand_kit.html`), each overridable via
  `BRAND_KIT_FONTS`/`BRAND_KIT_CLIPS`/`BRAND_KIT_OUT` env vars.
- The 4 audio clips (sting/theme/vault/sid.mp3) no longer existed anywhere on disk;
  recovered them by decoding the base64 data URIs embedded in the canonical
  `brand_kit.html` into `brand/spz/clips/`.
- Verified: rebuild (defaults and env overrides) produces byte-identical
  `brand_kit.html` (1,551,042 bytes). Logged in `.wolf/buglog.json`.

## X (@spaceshipalpha9) channel added (2026-07-15)
- New `x/` folder at repo root — sibling to `linkedin/` + `substack/` — to publish,
  read, and manage the studio's X profile @spaceshipalpha9.
- `x/xclient.py`: `XClient`, a lazy Tweepy wrapper over X API v2 (+ v1.1 for media
  upload & profile edit). Offline-safe helpers: `weighted_len()` (X weighted chars,
  URL=23/CJK=2), `split_thread()` (paragraph→sentence→word packing, numbered i/n).
  Connections built on first use; `dry_run=True` prints writes, no network/creds.
- `x/xcli.py`: CLI — post/thread/reply, whoami/profile/read/tweet/mentions/export,
  delete/like/retweet/follow/set-profile. Every write honors `--dry-run`.
- Creds: `X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_TOKEN_SECRET` (+ optional
  `X_BEARER_TOKEN`, `X_HANDLE`) in gitignored `.env` (template in `.env.example`).
  `tweepy>=4.14` added to pyproject deps. `x/export/` gitignored.
- Docs: `x/README.md` (setup/auth/usage + Free-tier can write but not read) and
  `x/PROFILE.md` (the social-network reference: voice, content pillars, cross-channel
  map, API tiers/limits). Recorded in `.wolf/anatomy.md`.
- Verified offline: thread-split stays ≤280, dry-run post/thread/set-profile, and
  the missing-credential path is a clean error (no traceback). Live posting needs
  the four X_* keys in `.env`.
- Next-build hook (not done): `x/build_x.py` mirroring `linkedin/build_li.py` —
  read `substack/series_data.py` → emit per-day X posts/threads → `xcli.py thread`.

## 2026-07-15 — Studio repo docs set (branch spz/studio-repo-docs-setup-efc7a9)
Made the repo formally THE studio repo. New documentation set:
- `README.md` rewritten as studio front page; `CLAUDE.md` (new, AI entry point);
  `RULES.md` (new, enforceable studio rules with gates).
- `docs/` (new): CATALOG.md (all properties + status), OPERATIONS.md (ops
  runbook), INFRASTRUCTURE.md (GCP/Cloud Run/buckets/domains),
  BRANCHES.md (branch & worktree ledger + studio debt).
- `brand/spz/ENFORCEMENT.md` (new): pass/fail brand gate (hex/font/voice/sonic
  audits) — flagged build_brand_kit.py hardcoded stale paths.
- Per-book READMEs replaced (were generic autonovel boilerplate):
  digital-insurgency, the-last-human-ceo, zero-trust-reality (marked as stale
  TLHC clone → real Defense book on spz/zero-trust-research-analysis-24ce8e),
  neko-death-cult (new — had none).
- `.claude/commands/` (new): /studio-status, /new-book, /publish-book,
  /brand-check, /social-kit. `.wolf/OPENWOLF.md` created (was referenced by
  ~/CLAUDE.md but missing). `.wolf/anatomy.md` rewritten to current truth.
- **asset-mcp integrated**: code was UNCOMMITTED in the cloud-run-mcp-assets
  worktree (branch tip == master); copied into this branch (108K, .venv
  stripped) and documented as the studio's MAIN MCP ENDPOINT everywhere.
Key discoveries: books/zero-trust-reality on master is a byte-identical TLHC
clone; root book files are a byte-identical DI duplicate; main checkout sits
on the autonovel/the-last-human-ceo archive branch.

## 2026-07-15 (later) — Worktree sweep + vessel canon + repo boundary
- Swept all 13 worktrees for uncommitted work. Finds recorded in
  docs/BRANCHES.md §Uncommitted work: spz-brand-machine (32M, main checkout),
  SA9 Publishing Pipeline vNext Phases 2-4 BUILT (jovial-hodgkin publishing/),
  SPZ Site Kit specs (zen-heyrovsky web/), DI website source + art/ (main
  checkout). load-secrets.sh rescued + committed here.
- Queried LIVE asset-mcp: 551 assets. the-last-human-ceo = 0 indexed (biggest
  gap); zero-trust backfill (1192) pending; brand-spz only 8. Gaps in
  docs/BRANCHES.md.
- Canon: UNIVERSE.md §1a "The vessel" — ONE canonical SA9 saucer (dome cockpit
  w/ empty twin seats, pink circuit-grid hull, SPACESHIP ALPHA 9 nameplate,
  red beacon, teal tractor beam). RULES.md §3.5 + ENFORCEMENT vessel check +
  asset-mcp spz_style.json spaceship motif rewritten (was a drifted wireframe
  ship — container needs redeploy to pick it up).
- Boundary: RULES.md §8.0 + CLAUDE.md + README — studio stuff lives HERE,
  never in the SpaceShipAlpha9 repo (product/site code only).

## 2026-07-15 — Merged studio-docs branch with master
Merged origin/master (brand-kit reproducible build PR #6, x/ channel PR #5,
DI 2E merge PRs #3/#4, album release packaging, SPZ headshot canon) into
spz/studio-repo-docs-setup-efc7a9. Docs updated to match: 2E + x/ now on
master; brand-kit path issue RESOLVED; DI art/spaceships/ holds the canonical
vessel renders.

## 2026-07-15 — Studio web merged; boundary finalized
PR #7 brought the SA9 + SPZ marketing sites INTO autonovel at web/
(sa9-website = spaceshipalpha9.co, spz-site = spacepiratezero.com, shared
@sa9/* packages, links.json, STUDIO-MIGRATION-PLAN.md). Boundary docs updated
to the plan's division table: studio side (books/web/marketing/SEO/brand) =
autonovel; hardcore products = SpaceShipAlpha9 repo. RULES §8.0, CLAUDE.md,
README, anatomy, CATALOG, BRANCHES all reflect it. Phase 2 (workspace wiring:
pnpm-workspace + workspace:* deps) still pending.

## 2026-07-15 — PR protocol rule added
RULES.md §8.5: PRs never mention Claude/AI (title/body/comments, no generated-
with footers); lifecycle fixed: open → review → resolve ALL issues → merge.
Echoed in CLAUDE.md non-negotiables + cerebrum Preferences.
