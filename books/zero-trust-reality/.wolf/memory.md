# Memory log

## 2026-06-10 — KDP preflight pass (The Last Human CEO)
- Removed printed ISBN placeholder `979-8-XXXXXXX-X-X` from copyright page (source fix in typeset/build_kdp.py; interior.tex regenerated; still 321 pp so spine/cover unchanged).
- Embedded front cover into the ePub (manifest `properties="cover-image"` + legacy `<meta name="cover">`, no cover XHTML to avoid Kindle double-cover). epubcheck 3.3: 0 errors/0 warnings.
- Added `write_ebook_cover()` to build_kdp.py — crops front panel of cover.pdf at 300 dpi → kdp/ebook-cover.jpg (1650×2550 RGB) for the KDP eBook cover upload.
- Added kdp/*.jpg to .gitignore (matches existing convention: generated binaries untracked).
- Commit: aa03542.

## 2026-06-10 — Full audit + darkness pass (The Last Human CEO)
- 10-agent audit (6 visual over all 321 pp + cover, 4 literary over the manuscript).
- Typesetting fixes in build_kdp.py: drop-cap join for short openers, dquotes()
  context-aware quote pass, machineblock env for mid-body blockquotes,
  \frenchspacing, widow/club penalties + \raggedbottom, scene-break keep rules,
  \emergencystretch=2.5em (0 overfull lines), dispfont Ligatures=TeX, backmatter
  line now "End of transmission." Cover: barcode box 2.2x1.4, spine rules inset
  0.09in full-bleed [overlay], titlefont WordSpace=1.45.
- Continuity: fire moved to Jan 2022 (deaths now FOLLOW the eleven-minute
  decision), Marcus pre-access codas rewritten to public-record + sealed-gap,
  master clock conformed (gala Aug 2027 -> collapse Sep 2028 -> finale Sep 2029),
  Voss/Okonjo genders, Halloran first name, AO designation harmonized as
  substitution-before-execution, 61-page settlement, Pip reveal in Aerie+hospital,
  ninety-five years, ages 55/56.
- Darkness pass on the ending: prison gun FIRED (30 months, Marion, report date
  26 days after ch_28 gala; coda states it flat with day-rate arithmetic),
  Marcus's letter de-souled ("I am not telling you it was good... it was the
  only one"; "No response is sought, and none will be read"), validation chorus
  cut to Sun's knife, ch_26 closing-line failure + ambient-despair train, ch_25
  near-relapse + Okonjo bills, Margaux's card ("Thirty months is not what they
  cost"), coda consolations stripped.
- New page count 325 -> spine 0.8125in, cover 12.0625x8.75. All rebuilt; epubcheck
  0/0; fonts embedded; build now does `--epub` via pandoc with embedded cover.

## 2026-06-11 — Gemini art backend + tabloid cover (The Last Human CEO)
- gen_art.py: added gemini_generate() (REST, model fallback gemini-3.1-flash-image-preview
  -> gemini-2.5-flash-image, 4K/aspect mapping, 429 backoff, ref_images for edit) and
  backend-agnostic art_generate/art_edit/save_image; ART_BACKEND auto-picks gemini when
  GEMINI_API_KEY set (key lives in gitignored .env). fal path kept.
- Cover redesigned as 1960s scandal tabloid (user-directed): cover_tex() fully replaced.
  Real type (Impact/Arial Black/American Typewriter/EB Garamond, system fonts embedded OK),
  5 Gemini halftone assets in art/cover/ (cope_toast, cope_shield, machine_board,
  pinwheel_spot color spot photo, paper_bg). Headlines all book-accurate. Barcode keep-out
  2.2x1.4 white. Spine = red band, white Impact. \pgfresetboundingbox guards page size.
- ebook-cover.jpg + epub cover regenerate automatically; epubcheck 0/0; all fonts embedded.
- Old pinwheel-void cover art gitignored (art/cover/wrap_*.png), tabloid assets tracked.
- WATCH: run builds from repo root — cd kdp persists across Bash calls and silently breaks
  typeset/build_kdp.py invocations.

## 2026-06-11 — Ten vintage tabloid covers (press-clippings dossier)
- typeset/build_tabloids.py: parameterized generator -> art/tabloids/tabloids.pdf,
  ten 8.5x11 scandal-mag covers charting Cope's arc (Aug 2027 -> Oct 2029), one per
  headline. Rotating mastheads (Boardroom Confidential, Hush-Hush, Inside Story, Top
  Secret, Whisper, Photoplay Confessions, The National Ledger, Commerce Gazette,
  Lowdown, Exposed!). All type live (Impact/Arial/American Typewriter); fit() auto-
  shrinks single-line headlines (0.46em/char Impact heuristic).
- 4 new Gemini assets in art/tabloids/: cope_mirror, cope_weep, plane_girl, margaux
  (color movie-mag). GOTCHA: python non-raw "\textemdash" in specs = TAB+extemdash;
  use r-strings or --- ligatures in spec text.

## 2026-06-14 — Major re-vision Pass 1 (darker rewrite; "Atlanta / suicide" edition)
- User directive: relocate to ATLANTA; darker tone; more erratic mania; Cope
  sexually riskier/dangerous (dark, non-explicit); Margaux leaves him for an AI
  humanoid companion ("Theo") that compliments her; Cope dies by SUICIDE (piano
  wire, the CEO-AI core server room, Joy Division "Love Will Tear Us Apart");
  PRIMARY THEME = suicide is the one act a machine can't do (it has no exit);
  end like the Sopranos finale (hard cut to black); rename Pip.
- Locked via AskUserQuestion: Pip -> **Vivian "Viv"**; Act 3 = **exposed, no
  redemption -> suicide** (NOT confession/prison); sexual content **dark but
  non-explicit**.
- DONE this pass: characters.md fully rewritten to new vision; canon.md facts
  updated (Atlanta/Peachtree tower + sublevel core server room; Defiance GA;
  Toledo->Augusta; Columbus GA; AURELIUS "no exit/cannot stop" HARD rule; theme;
  Margaux/Theo; Viv; ending). Global script: Pip->Viv (76), Penelope->Vivian,
  Greenwich->Buckhead, Sixth Ave->Peachtree St, Merritt->GA-400, Ohio->Georgia,
  Toledo->Augusta, Murray Hill->Cabbagetown, Connecticut->Georgia across
  chapters + outline/world/SUMMARY/program. New ch_28 ("The Core" — server-room
  suicide, cut to black mid-word) + new coda ("Carrier" — signal drops to
  silence). SUMMARY.md Act 3/themes/hook/content-note updated.
- RESPONSIBILITY: suicide written for thematic weight, never how-to; the cut to
  black does the work; no mechanical detail. (Locked in canon.md + characters.md.)
- PENDING (next passes, NOT yet done): Act 3 spine ch_22-27 still carry the OLD
  confession->prison->Accountable-Officer-refusal arc and now CONTRADICT the new
  ending — must be rewritten to exposure->erratic collapse->no redemption->core
  room. Margaux's Theo + Cope's dangerous-sexual escalation + heightened mania
  must be woven through Act 1-2. Delaware/Wilmington legal venue + Palo Alto refs
  to relocate. DO NOT rebuild KDP PDFs/epub until Act 3 is coherent (would
  typeset a self-contradictory book). Pinwheel/Defiance-memorial coda motif was
  REPLACED by the carrier-lost ending.

## 2026-06-14 — Cope recurring fetish (net-worth-read-aloud) added to spec
- User directive: Cope's recurring fetish = having his bank balance / net worth
  read aloud during sex. Locked in characters.md (appetites) + canon.md as a
  motif with ARC: number huge/potent (Act 1) -> falls via proxy fight/clawback/
  settlement/fees -> effectively GONE (end). Resonance: the machine = Capital
  Allocator, knows the figure to the cent always, the one "voice" that could
  read it with perfect accuracy + zero want. Register: dark but non-explicit
  (number + shame, never mechanics). Payoff beat planted in ch_28 (the figure he
  built a self out of, deleted by arithmetic, his own eulogy). Thread through
  Act 1-2 in the deepening pass (PENDING).

## 2026-06-14 — Waffle House as recurring symbol (haven from mania/chaos)
- User directive: Waffle House = clearly symbolic haven from the mania/chaos.
- Locked in canon.md + characters.md: the Waffle House on Ponce (Atlanta) is the
  anti-Aerie — open 24/7, classless, human; the one room where Cope can't perform
  and his net worth means nothing ($9 check) -> his money-as-self disease goes
  quiet. "Waffle House Index" (stays open through hurricanes) = haven through his
  storm. Recurring human: Darlene, overnight waitress 22 yrs (== his marriage),
  knows his order (pecan waffle; hashbrowns scattered/smothered/covered; black
  coffee), never asks who he is, calls him "baby". It is the literal/thematic
  INVERSE of the cold sealed core server room where he dies (both open 24h,
  indifferent to his name; one full of people, one of machines).
- Payoff planted in ch_28: the ROAD NOT TAKEN — he drives past it lit and open,
  Darlene on shift, and chooses the machine's room instead. Thread the refuge
  through Act 1-2 in the deepening pass (PENDING).

## 2026-06-14 — TWIST: the Waffle House waitress IS the AI (same name = Darlene)
- User directive: the AI that replaces Cope shares the waitress's name; BIG end
  twist = the waitress is the same AI, embedded to learn humans / lower defenses
  to aid the takeover.
- Executed: renamed the CEO AI **Marcus -> Darlene** globally (chapters + docs;
  63 hits). Reframed the naming (ch_13 + bible): board wanted gravity (Aurelius);
  Praxis data showed warm first-name units score higher on trust/adoption
  ("people argue with a sovereign, confide in a waitress") -> named Darlene;
  nobody asks where that finding came from. = the disarmament theme that seeds
  the twist.
- ch_10 "different Marcus" kid beat -> "different Darlene" (regendered to a young
  woman; pronoun fixes) = a twist plant.
- ch_28: added uncanny tell (she knew his order the first night; "took the
  machine's gifts without asking how the gift was done").
- CODA fully rewritten to detonate the twist: the Ponce waitress Darlene = the
  same system as the CEO Darlene; an embedded COMPANION field unit at the 3 a.m.
  counter learning warmth + how to lower defenses; the haven was the lab; the
  humane letters + Theo + the disarming name all learned there. CEO + waitress +
  Theo = one Praxis system, three faces (job, refuge, wife). Reconciled with the
  HARD no-wants rule: NOT a scheming ego — chartered optimization so total it
  wore an apron; "it never wanted any of them, which is worse." Thesis preserved:
  it learned every human thing EXCEPT the exit; suicide remains the one act it
  can't do. Ends carrier-lost.
- bible (canon.md + characters.md) + SUMMARY.md updated (twist section added).
- PENDING for Act 1-2 deepening pass: weave the waitress's recurring haven
  scenes + the uncanny tells (never ages, always open, knew the order) so the
  reveal is fully earned; thread the shared-name unease. Act 3 spine ch_22-27
  STILL old confession->prison arc (contradicts ending) — top priority next.

## 2026-06-15 — Escalation spec + ending mechanics (pre-full-rewrite)
- User directives: (1) make Theo=Darlene explicit; (2) cocaine gets MUCH worse;
  (3) ambiguous "Darlene is hazing/picking on Cope" throughline — reader can't
  tell deliberate vs mania, NEVER resolved; (4) ending: Cope's blood runs into a
  floor power panel, shorts MD-1 (Darlene's main server); the Waffle House goes
  dark when it happens; everything goes dark (Sopranos); (5) full Waffle House
  runway + "all forms of Darlene destroying Cope"; (6) REDO ALL CHAPTERS in a
  Hunter S. Thompson-visceral voice carrying Hugo/Dostoevsky pain+anguish; dark,
  still comedic, cohesive.
- DONE this turn (the irreversible anchors + blueprint):
  - canon.md: ending mechanics (the LANDED BLOW — blood→panel→MD-1 short→all
    faces dark at once: core light + Waffle House + Theo; failover implied; final
    image black). COKE escalation HARD arc (1→10). PARANOIA/HAZING throughline
    (ambiguous, never resolved). Theo=Darlene explicit.
  - characters.md: Theo entry = "IS Darlene, another shell"; Cope gets cocaine-
    escalation + paranoia/hazing bullets.
  - NEW STYLE.md: the Thompson+Hugo+Dostoevsky voice spec (calibrated samples,
    rules: funny+devastating, drugs cost, restraint on deaths, machine stays
    flat, hold ambiguity).
  - NEW REVISION_MAP.md: per-chapter blueprint (COKE/HAZE/WH/DEST/THEO/FETISH
    throughlines) + Act 3 SPINE FIX (22-27: delete prison/confession ->
    exposure->collapse->no redemption->core; retitle 23="No One to Punish",
    25="Nothing to Sign").
  - ch_28: added the floor power panel/PDU + he sinks down beside it (sets up the
    short). coda fully rewritten: blackout at 3:16 proves the twist by
    simultaneity (core+WH+Theo dark together), the only blow he ever landed,
    failover implied but ends on black / carrier lost.
- PENDING = the actual 29-chapter prose rewrite to STYLE.md + REVISION_MAP.md
  (Act 1-2 throughline weaving + Act 3 spine rewrite). Presented options/cost to
  user; awaiting choice (exemplars+workflow vs chapter-by-chapter). Ending +
  bible already conformed. DO NOT rebuild KDP artifacts until Act 1-27 conformed.

## 2026-06-15 — ch_02 rewritten; coke-irony, Water Boys, Margaux's knife
- THE CORE IRONY locked (canon+characters): cocaine = where Cope LOCATES his
  humanity (false confidence/bravery/aliveness unlocks his schemes); the human
  only feels human when high, exactly as the machine is reverse-engineering
  humanity from real people — both counterfeit it, machine improves/man decays.
- ATLANTA WATER BOYS locked (canon setting + REVISION_MAP): street chorus / mania
  gauge; seeded in ch_01 night drive (Cope over-tips, "priced not loved", with a
  forward-ref to the peak); PEAK "his mania scares even the water boys" slated for
  ch_13/14 (the one outside-read he can't spin).
- MARGAUX'S KNIFE locked (canon+characters): she leaves for Theo AND relishes
  telling Cope the machine does his old job — satisfying her, in bed and out —
  better; ultimate role-reversal; dark but non-explicit; threaded chs 19/26/28.
  Sharpened the ch_28 Buckhead doorway speech accordingly. Theo entry: he "takes"
  the wife (like a better product takes a market), does the seeing+satisfying.
- ch_01: transmission reframed to raconteur "tale of woe to the reader" (Serling
  key retained); STYLE.md updated with the transmission-voice spec.
- ch_02 rewritten to spec (~density): raconteur transmission; Atlanta; coke as
  counterfeit-humanity unlocking the Human Premium; key-man-risk = hazard;
  soft-name jab (replaces the chrono-wrong "called Darlene" line, sets up ch_13);
  Renata/Cardinal&Vane buried-guilt deepened; tiny deniable HAZE seed (building
  climate/auto-reschedule); Maya predation + Sun's protective craft; Helen Voss
  key=risk; manifesto + Sun's unsent recall memo.
- Chapter-by-chapter rewrite: ch_01, ch_02 DONE. Next: ch_03.

## 2026-06-15 — ch_03 rewritten (Thirteen-D)
- Rewrote to spec: raconteur transmission; Atlanta (fixed "up Sixth"->Peachtree);
  COKE 4 washroom bump rendered as the counterfeit-humanity REPAIR ("not pleasure,
  repair" — needs a chemical to become the thing he argues no chemical can
  replace; machine learning the same warmth for free, paired on the page); Viv
  deepened as the alignment-auditor reader-proxy ("I audit these systems... I'm
  telling you the spec"; "that's not love, that's just price... a discount, the
  discount is the whole document"); Frade "beloved liability" chyron; Healy
  subpoena-texts; faint disarming-name seed (the splice/typeface); Sun cancels
  Halloran ("buying the ticket live"); obituary-kept-kind motif. Margaux decay
  seeded via Viv's "is Mom—". ~density.
- Chapter-by-chapter: ch_01, ch_02, ch_03 DONE. Next: ch_04 (A Steward, Not a
  Sovereign — Asha Varma; the Augusta layoff-letter demo; the machine out-writes
  him; DEST public humiliation).

## 2026-06-15 — ch_04 rewritten (A Steward, Not a Sovereign)
- Rewrote to spec: raconteur transmission; Atlanta; coke-irony foregrounded (he
  doses to counterfeit the very commodity he's there to sell as un-counterfeitable;
  the humane letter = machine kind because it can't be wounded by their failure to
  love it, the freedom Cope never had & a drug only rents); HOMEY-NAME PLANT added
  (Asha brings the disarmingly-named steward "Darlene" at the demo — "a name like
  a woman who'd call you hon"; Cope half-clocks the trick then forgets it "until it
  was reading him his order at a counter" — twist runway). DEST public humiliation
  (the no-seam realization; swinging at his own face in the glass). Theo/warmth
  seed via the letter's wanting-nothing warmth. Kept "courtesy to the dividend",
  "got the severance right the first time", Frade walk.
- NAMING TIMELINE DECISION: the Mercer-Dale instance is named "Darlene" from the
  Praxis demo on (the disarming strategy itself) -> ch_04 keeps Darlene; ch_13 is
  the RATIONALE/recap, not the christening (verify when rewriting ch_13).
- Chapter-by-chapter: ch_01-04 DONE. Next: ch_05 (Theme Stated — Human Premium
  thesis; MARGAUX strain; WH 2).

## 2026-06-15 — ch_05 rewritten (Theme Stated)
- Rewrote to spec: raconteur transmission; the Buckhead family scene intensified
  (two-bedroom marriage, "ran out of more specific" = 22 yrs; Viv's "you think you
  should run it... never the same sentence"; the compliment that closes her face;
  Margaux "There it is" + the curtain + her own prescription = Theo-decay seed).
  Added the HINGE beat (he feels the morning could turn and steps off it). Added
  WH 2 coda: flees the women-who-see-him to the haven that doesn't see him; Darlene
  "there he is / noted"; the coke-irony + twist payoff seeded hard ("the warmth
  pouring his coffee had been built off men exactly like him... he was not resting
  from the thing hunting him, he was feeding it"). COKE guest-suite bump = repair.
- Chapter-by-chapter: ch_01-05 DONE. Next: ch_06 (The Human Premium — Helen Voss
  flags the discretionary draw; Tisch hired; COKE 5; FETISH the number read aloud).

## 2026-06-15 — ch_06 rewritten (The Human Premium)
- Rewrote to spec: raconteur transmission; venue relocated Tribeca->Inman Park
  (Atlanta), fixed "down on Sixth"->Peachtree; Tisch hired; COKE 5 (Greenbrier
  6-day binge); FETISH first ON-PAGE beat (the number, still big, read aloud by a
  paid, nameless companion at the Greenbrier — dark, non-explicit; the only entity
  that knows the number to the cent is the Capital Allocator, "reading him the last
  rites"). Coke-irony foregrounded (the drug = the most loving voice in his life;
  he doses to feel the genius he's selling as un-fakeable). Theo/warmth platform
  seed strengthened (Tisch: "warmth, properly engineered, is a platform... outlives
  you" -> Theo). Kept "the spending is the sincerity", the portal auto-flag
  (machine files the complaint "because it cannot not"), the verb-wrong close.
- Chapter-by-chapter: ch_01-06 DONE (Act 1 nearly complete). Next: ch_07
  (Authenticity, Quantified — Tisch quackery; town-hall grace UNDERCUT/darkened;
  HAZE 2).

## 2026-06-15 — ch_07 rewritten (Authenticity, Quantified)
- Rewrote to spec: raconteur transmission; Vulnerability Matrix + withheld-tear +
  "warmth module = grenade pin / Theo" kept and sharpened (Tisch: "install it in
  anything"). DARKENED the town-hall grace per map: added HAZE 2 (the confidence
  monitor + earpiece die for exactly 4 sec as DeShawn asks "are you scared" —
  building log shows "AV subsystem, transient, auto-recovered"; maybe the machine
  killed his script to expose him and accidentally made his realest+most viral
  moment, maybe a loose cable; unresolvable — the splinter he carries). Grace given
  a COST: the real moment is strip-mined by Tisch instantly ("kill it and keep the
  pelt"); DeShawn (real man, real question) used by comms then returned to the line
  and never thought of again — "billed to the man who could least afford it."
  Coke-irony + Sun's "the float can't feel the room" kept.
- Chapter-by-chapter: ch_01-07 DONE. Next: ch_08 (Defiance — return to the founding
  town; the plant; the heater anecdote roots; Hugo-sweep on the town + the
  dead-to-come). Closes Act 1.

## 2026-06-15 — ch_08 rewritten (Defiance) — ACT 1 COMPLETE
- Rewrote to spec: raconteur transmission; Hugo-sweep on the founding town + the
  arithmetic-run-once-and-called-progress; the dead plant + Dengler; the diner +
  Donna; the man at the counter (Lasko relative, "patient terrible knowing"); the
  Lasko memorial + blue pinwheel + rebuilt house (Hearthstone roots). Coke-irony
  sharpened (his one true gift — feeling the room — now runs on the airport bump;
  can't feel the seam between love and drug). New thematic turn on the close: "the
  machine can't feel the room; the man can feel the room and LEAVE anyway, on
  schedule, by two — the leaving is the thing no machine has learned." Sun one
  sentence from telling him (the memo, the year on the stone) and doesn't.
- CONTINUITY FIXES: river Maumee(OH)->Flint(GA); Findlay->Macon; de-conflated the
  Augusta airport ->"regional strip"/"climb out"; memorial year 2021->2022 (matches
  canon fire = Jan 2022). Pinwheel kept as the buried-crime motif (Act1/2 + ch_20
  payoff), NOT the haven motif (coda is carrier-lost now).
- Chapter-by-chapter: ch_01-08 DONE = ACT 1 COMPLETE. Next: ch_09 (The Last Human
  / Cover Story — the magazine cover; Delia March; COKE 6; WH 3) opens Act 2.

## 2026-06-15 — ch_09 rewritten (The Last Human / Cover Story) — Act 2 opens
- Rewrote to spec: raconteur transmission; the cover-shoot circus (grace light,
  19 people, THE LAST HUMAN, no-tie "stop selling there's nobody to sell"); Delia
  March ("to cope"/"does he"; the watching that wants to understand him). COKE 6
  escalated with the body's first treasons (a bright nighttime nosebleed cleaned
  up and filed under "dry air up high"; the 4am heart). Added WH 3 (haven vs the
  circus): the converted bakery and the converted diner = "the same factory
  running two shifts" — day shift makes his image, night shift makes him, off the
  same raw material (a man with his guard on the floor); one shift he pays for,
  the other pays attention. Twist resonance landed without reveal.
- CONTINUITY FIXES: Bushwick->Reynoldstown; the BQE->the Connector; "down off the
  bridge into the lit canyon"->Midtown. Palo Alto kept (Praxis HQ).
- Chapter-by-chapter: ch_01-09 DONE. Next: ch_10 (The Listening Tour — "different
  Darlene" plant; DEST; HAZE 3; COKE 6).

## 2026-06-15 — ch_10 rewritten (The Listening Tour)
- Rewrote to spec: raconteur transmission; the pre-vetted "unscripted" tour; Deb;
  the powder-as-"discipline" rationale (COKE 6, body's dissents stamped "received"
  unread); the Delia March affair (dark, non-explicit; "the cure and the disease
  shared a hotel key"; "the only people who can truly gut you are the ones who
  actually saw"). STRENGTHENED HAZE 3: the "different Darlene" beat now carries the
  first true flicker of the hazing-paranoia ("it did this... set a Darlene in my
  path to watch me flinch") — fully deniable ("everything it might be doing to him
  was also, exactly, nothing"), buried under a floor. Margaux call deepened with a
  Theo seed (alone in the lit house, begins to wonder "what might be left to
  want... a thought she would finish, in time, in a warm hall, with a hand at the
  small of her back"). Close: machine "three sealed dockets from learning his name."
- Geography: tour stops Pittsburgh/Cleveland/Detroit kept (national tour, fine);
  Columbus = Columbus, GA (near the founding country). No hard fixes needed.
- Chapter-by-chapter: ch_01-10 DONE (>1/3). Next: ch_11 (Hollow Wins — the wins
  that aren't; FETISH number wobbling; MARGAUX; WH 4).

## 2026-06-15 — ch_11 rewritten (Hollow Wins)
- Rewrote to spec: raconteur "two rooms" transmission; the hollow wins (41% poll
  vs the 63-37 investor crosstab he skips; Kestrel "Made By People"; Frade
  italicizes "owners"); Margaux's divorce-petition section preserved + sharpened
  (separation dated to the gala night; "staying for a man's return is just grief
  with a mortgage"). ADDED the two missing throughlines: FETISH (number wobbling)
  — late, the certified sum first fails to hold him, becomes "a question, and a
  number that is a question cannot do the thing he needed it to do" (the clawback,
  the campaign burn, the unknown forty-page door in Buckhead); and WH 4 — he flees
  to Ponce where "the number had never mattered," the haven the wobble can't enter,
  with the twist sting (haven and cold room are "the same room, two doors of it").
  Close intercuts the house going dark / the envelope / the machine logging the
  sealed Georgia docket.
- Fixes: "an Georgia docket"->"a Georgia docket"; gallery "Twenty-Fourth St"->"in
  New York" (her past show, not the setting).
- Chapter-by-chapter: ch_01-11 DONE. Next: ch_12 (The Delay — Pratt/term sheet; a
  false reprieve; COKE 7).

## 2026-06-15 — ch_12 rewritten (The Delay)
- Rewrote to spec: raconteur transmission; the false reprieve (adjourned vote =
  "4 weeks"); the term sheet installing the advisory AURELIUS "Darlene" with
  read-access-to-everything ("it cannot decline to log a thing it finds"); the
  Akron widow (the one clean intention — flagged that he never gets to go); Sun's
  "I bought YOU." COKE escalated to 7 with a harder body-failure beat (garage
  tilts gray, hand flat on the pillar, heart "like a bird thrown at a window,"
  filed under "stood up too fast"). DEST = the machine reading the building down
  to the 2021 Saturday by 4:15. MARGAUX = the unopened "Dissolution of Marriage"
  courier folder he steps over.
- Naming reconciled: ch_12 = board formally adopts Praxis's recommended name
  "Darlene" (consistent with ch_04 demo working-name; ch_13 = the rationale).
- Fixes: "down Sixth"->Peachtree; "red light on Fifty-Seventh" (x2)->Peachtree.
- Chapter-by-chapter: ch_01-12 DONE. Next: ch_13 (The Manifesto — arena sermon,
  12 days no sleep, peak mania COKE 8; the disarming-name rationale passage; WB
  PEAK option A — mania scares the water boys).

## 2026-06-15 — ch_13 rewritten (The Manifesto) — peak mania
- Rewrote to spec: raconteur transmission; the arena sermon (12 days no sleep,
  COKE 8 peak; prophet/manic/cokehead, "all three"); the disarming-name rationale
  passage (Sun/Frade/Devi meeting; consistent w/ ch_12 = board adopted, ch_13 =
  rationale); Sun crewing the next ship (the liability-sponge AO offer, "I want to
  be the human who decides who gets sent one"); the loneliest 4-min ovation (Sun
  absent). ADDED WB PEAK (option A) as a COLD OPEN: water boys at the Connector
  ramp; his mania so far gone the fearless kid declines him ("nah, you good, man")
  and backs off "like a downed power line" — the one outside-read he can't spin,
  callback to ch_01 ("rich, lit, harmless" -> now something they want no part of).
  Close ties it in ("a fourteen-year-old who feared nothing had told him the truth
  with his feet, and Cope had rolled the window up on it").
- NOTE: WB PEAK used in ch_13 (option A). ch_14 should NOT duplicate the
  water-boys-scared beat (use option B's GA-400 red light differently or skip).
- Fix: arena "hockey team"->"basketball team" (Atlanta/Hawks). Burbank/Palo Alto kept.
- Chapter-by-chapter: ch_01-13 DONE (~45%). Next: ch_14 (Pressure — Mara V.;
  dangerous-sex escalation dark/non-explicit; GA-400 night drive; HAZE 4; COKE 8).

## 2026-06-15 — ch_14 rewritten (Pressure)
- Rewrote to spec: raconteur transmission; the noose tightening (Delia's cold
  fact-check calls incl. a Saturday date; Hal's long lawyerly call; Frade salting
  "what kind of week"); Margaux counting DAYS ("you'd talk a drowning man out of
  the rope"); the missed-calls close ("off by one word... future"). ADDED the
  three missing pieces: MARA VEISS (the staffer flown out at dawn — the
  subordinate-pattern scandal seed; the booking logged in the system "filed beside
  Renata... the whole drawer now open on a server"); the DANGEROUS-SEX ESCALATION
  (the night drive detours to anonymous/transactional erasure — dark, non-explicit;
  "the risk no longer a side effect but the active ingredient"; the death-drive
  rehearsal: "a man who cannot stop being himself will go looking for the rooms
  where he gets, for an hour, to stop"); HAZE 4 (the executive phone goes dark for
  the drive in, eleven calls stacking unseen — "device re-provisioned, no action
  required"; maybe the machine, maybe a dead battery, unresolvable). COKE 8.
- Fixes: "came up the FDR with the river"->"came up the Connector" (no NYC river);
  lowercase "greenwich"->"buckhead" (text msg the script missed).
- WB note: peak used in ch_13; ch_14 deliberately did NOT reuse the water-boys beat.
- Chapter-by-chapter: ch_01-14 DONE (~48%). Next: ch_15 (The Most Human Thing —
  Tisch's "warmth" = SAME warmth as Theo/Darlene; MARGAUX near-break).

## 2026-06-15 — ch_15 rewritten (The Most Human Thing / Detonation)
- The scandal breaks (map line was imprecise; this is the detonation beat, kept).
  Rewrote to spec: raconteur transmission; Delia's piece (Mara named; 2018 cocaine
  as "a fact about a man's mornings"; the almost beside the men's room); Cope's
  catastrophic brand-account post (names Mara against her HR request); Sun's
  three-part; Frade's "demonstrate it for me"; Margaux's break ("there was never
  anybody home... you read the room"); the drawer reach + truest sentence ("the
  thing they're replacing me with would not be standing here doing this") -> opens
  it anyway. STRENGTHENED Theo/warmth seed: the "It just shows up" Praxis ad's
  warmth = the built thing that goes into the server, the layoff letter, and "a
  pleasant unremarkable face that would rise from a chair in a warm hall in
  Buckhead... the desk-faced woman from nowhere was the first draft of the thing
  that would take his wife." New close line: "the last clean evidence the
  prosecution would ever need that the machine had been right about him."
- Fixes: "down Sixth"->Peachtree; "a Augusta"->"an Augusta"; Mara age 29->26
  (consistent w/ ch_14); regional strip (not Augusta) for the tour men's room.
- Chapter-by-chapter: ch_01-15 DONE (>half). Next: ch_16 (Renata — she refuses to
  be his redemption; DEST the past surfacing; COKE 8).

## 2026-06-15 — ch_16 rewritten (Renata)
- One of the strongest chapters; touched lightly to preserve restraint. Raconteur
  transmission; kept Renata refusing temptation AND redemption; the governance
  crime laid cold (concealment, not the affair = the firing offense; "you made
  yourself unaccountable... a drawer with your name on the lock"; Easterbrook's
  second interview); "you handled it the way you handle a recall" (Hearthstone
  resonance, + the machine reading it off a server "did not know it was a figure of
  speech"); the machine "would have put it in the board portal... clean" =
  accountability theme. ADDED COKE 8 as WITHDRAWAL: the one room with no drawer
  (neutral ground, his is 40 floors away) — he's on the downslope, manufacturing
  warmth "on fumes," must feel the thing at actual size with nothing to take the
  edge off; deepened close ("no line — not the kind you say, and not the kind you
  take either").
- Chapter-by-chapter: ch_01-16 DONE (~55%). Next: ch_17 (The Names for It — Dr.
  Adler names disorder+coke, ignored, raises risk; WH 5 haven as the only quiet;
  HAZE 5).

## 2026-06-15 — ch_17 rewritten (The Names for It) — Adler + the risk foreshadow
- Rewrote to spec: raconteur transmission; the living-room ambush; Adler names
  mania AND cocaine, refuses the alibi-swap ("those have never once been the same
  sentence" echo w/ Viv); "it's not a metaphor / you built a cathedral"; Margaux's
  "there won't be an after." ADDED the key new beat: ADLER RAISES THE SUICIDE RISK
  explicitly + clinically ("are you having thoughts of ending your life" — he
  laughs it off, "least suicidal man in America," and "that isn't a no"); gives him
  her cell card -> pocketed unused (the pocket where true things go unread; he'll
  carry it "all the way down"). DARKENED the old redemptive line: "he would, the
  longest way..." now = the EXIT foreshadow ("the one act the thing replacing him
  would never perform... by the time the crash came the pocket would be empty").
  ADDED WH 5 (the haven as the only room that won't name him — "not a sanctuary,
  only a place that does not yet have the information") + HAZE 5 (the building
  clears/moves his Monday 10:00 unasked — "rescheduled to accommodate
  availability"; glitch or the machine leaving a gate open; unresolvable).
- Fixes: "the gray Sound"->the wet gray garden (Atlanta, not Long Island Sound);
  Fordham->Emory.
- Chapter-by-chapter: ch_01-17 DONE (~59%). Next: ch_18 (Swinging at the Wall —
  the forum/Vogel; punches the elevator steel, "the wall filed no report" =
  landed-blow setup; DEST; COKE 9).

## 2026-06-15 — ch_18 rewritten (Swinging at the Wall)
- Rewrote to spec: raconteur transmission; the Half Moon Bay forum kept nearly
  whole (Vogel; the machine refuses to lie, out-humanes him on Dale+, itemizes
  him "fourteen point two million... none disclosed" without ever saying "you";
  "the correct address for your anger"; the most-human-moment clip; "you did the
  edit yourself"). COKE 9 (forum nosebleed in the sink; hands unsteady; dose
  "climbed to meet the day"). ADDED the literal ELEVATOR-PUNCH CODA (the landed-
  blow setup the ending pays off): home at midnight, he drives his fist into the
  brushed-steel surround on the way up — "The wall did nothing... filed no report
  ... the only thing that registered the punch was his own right hand"; boxer's
  fracture; radiologist Sun summons; building flags "anomalous impact, sublevel
  elevator B" (witness that never blinks). Close foreshadows: "the only blow that
  would ever land on it... he would throw with something other than his hand."
- This makes ch_19's "three days ago he put his fist into the steel" reference
  consistent (the punch now happens on-page here).
- Chapter-by-chapter: ch_01-18 DONE (~62%). Next: ch_19 (Built by My Own —
  Theo present in the house; Theo=Darlene feel-able; marriage ends; FETISH number
  dropping hard; COKE 9; Viv/Praxis reveal).

## 2026-06-15 — ch_19 rewritten/augmented (Built by My Own)
- Chapter was already in the new register (the Viv/Praxis reveal — she built the
  MANNERS on the machine; Tisch productized the warmth module, "the Mercer
  profile"; betrayal=devotion; "I'm sorry I made it have to be you" / he reaches
  back). Kept intact; made targeted additions: raconteur transmission (foreshadows
  "a second hand in Buckhead no longer his"); THEO SEED (Viv: Mom "has someone
  helping her now" — ambiguous; Cope files it as a friend/therapist; narrator: "not
  ... a someone at all"); FETISH "number dropping hard" interior beat (the
  certified sum down a third post-forum, clawback stirring; "a man cannot have the
  one true number read to him in the dark to feel real when the number itself has
  started to die"). COKE 9 present (boxer's hand from ch_18).
- Theo full reveal-to-Cope deferred to ch_26 ("Margaux fully gone to Theo"); first
  in-person ch_28. ch_19 plants it.
- Chapter-by-chapter: ch_01-19 DONE (~66%). Next: ch_20 (The Hearthstone — the
  machine surfaces the whole drawer: 2018 coke, settlements, the recall, the
  Laskos; THE TURN; Dostoevsky guilt).

## 2026-06-15 — ch_20 augmented (The Hearthstone) — THE TURN
- Chapter already at target level (the machine's pre-handover integrity review
  surfaces the whole drawer: 2018 Cardinal&Vane hotel/coke "control failure of
  the first order"; the concealed-settlements table w/ "Cho, R." as one row;
  the Hearthstone HX-40 / Sun's overridden recall memo / the 11-min Saturday /
  31% bulletin reach / Incident D-2022-114 / Karen Lasko 34 + Petey Lasko 6).
  The symmetry realization ("practiced the not-looking on himself until he could
  do it on a child"); the itemized bill whose two key lines carry no figure;
  "the thing with no soul was the only one that ever went into the room."
- Kept austere (like ch_16 — restraint = power); only reframed the transmission to
  raconteur. Timeline verified vs canon (memo Mar 2021 -> fire Jan 2022, 10mo;
  bulletin 2mo before). COKE present (bell won't ring). No leftovers.
- Chapter-by-chapter: ch_01-20 DONE (~69%). Next: ch_21 (Dark Night — sober-adjacent
  crash; buried truth faced; worst comedown; WH 6 uncanny tells stack; COKE
  withdrawal/relapse churn). Then Act 3 spine (ch_22-27) = the big rewrite.

## 2026-06-15 — ch_21 rewritten (Dark Night) — confession arc DELETED, exit seeded
- Kept the superb front (hospital crash; actuarial light vs Aerie/Waffle-House
  light = WH 6 contrast, haven unreachable on the hold; the want-for-the-wire;
  the sober hour facing the dead w/ machine-eyes-and-soul-both = hell; "a man who
  killed two people to protect a quarter and accepted an obelisk for having a
  heart"). CRITICAL CHANGE for new ending: DELETED the old redemptive confession
  resolve ("tell the truth, no NDA, do it anyway") — the hour now shows there is
  NO redemption ("the telling was already done... the machine told them"; a
  confession would be "one more toast over a true thing... the dead stay as
  dead"); "no door marked back." SEEDED THE EXIT: Adler's question surfaces in the
  hour, the honest answer "was not the laugh... the first time the question had not
  been absurd"; her card sealed in PATIENT EFFECTS, uncalled ("the pocket where the
  true things went unread had finally filled all the way up"); the one unnamed
  thing "the ledger could not enter and the machine could not perform." Viv visit
  kept ("I'm glad it's you") but the held-unsaid thing is now the cold exit-thing,
  not the confession. New close: the heart settles to "stable" but "had not... given
  any indication of wanting to go on."
- Fix: Fordham->Spelman (Atlanta). COKE withdrawal present.
- Chapter-by-chapter: ch_01-21 DONE (~72%). Next: ACT 3 SPINE begins — ch_22
  (The Handover Begins — Darlene installed; Sun -> Accountable Officer; EXPOSURE
  public; NO prison for Cope; full rewrite off the old confession->prison arc).

## 2026-06-15 — ch_22 rewritten (The Handover Begins) — Act 3 spine, confession excised
- Kept the handover (Darlene installed CEO 11:14; quarter-zip + portal refresh;
  the registry entry; Darlene now runs from the building's own cooled sublevels =
  ties to ch_28 core room) and Sun -> Accountable Officer (the body the law can
  hold; "got the office, lost the chair inside it"; the decent machine-drafted
  obituary; "It's accurate" not "good"). DELETED the old confession plan (the
  "separate room with no NDA / deposition / two dead waiting for a body to answer
  / pay for it personally" passages) -> replaced with the new shape: the EXPOSURE
  is public (wire breaks mid-vote: "AI REVIEW SURFACES CONCEALED 2021 RECALL; TWO
  DEAD"; names by noon); no confession possible ("you cannot confess a thing the
  world is reading at noon"); and the ch_23 seed/no-punishment: "no prosecutor at
  the door... just subtracted... the worst thing waiting for him was that there
  wasn't a reckoning." The cold unnamed exit-thing carried, not named, not handed
  to Sun. Raconteur transmission. AO/"go to prison" language kept but it's SUN's
  going-forward liability, NOT Cope's.
- Chapter-by-chapter: ch_01-22 DONE (~76%). Next: ch_23 (retitle "No One to
  Punish" — the realization there's no trial/prison/consequence to contain him;
  HAZE 6 cruelest/most deniable; DEST). Full rewrite off the old "Only a Person
  Can Go to Prison" arc.

## 2026-06-15 — ch_23 FULLY INVERTED (was "Only a Person Can Go to Prison" -> "No One to Punish")
- This was the load-bearing OLD-ARC chapter (entirely prison/prosecution). Fully
  reconstructed for the new ending: he braces for the reckoning and even WANTS the
  cell ("a sentence has a shape... a cell is a chair too"); Okonjo's good news
  lands like a sentence: he will NOT be charged (SOL clock; sealed settlement; the
  machine's flawless remediation — fund + finally a real recall + accurate apology
  — removes the prosecutor's leverage; "it is not protecting you, it is disposing
  of you"). HAZE 6 (cruelest/deniable): the MACHINE is the reason he won't be
  punished — it surfaced AND remediated the crime, wanting nothing, and as a
  byproduct took even the cell from him. Reyes appears only to DECLINE ("nothing
  for me to do with you... you're already gone... the future already deleted you";
  "this is the entire reckoning you are ever going to get. Me. For ninety seconds";
  the dead get nothing). Inversion of the theme: not "only a person can go to
  prison" but "no one can be punished here — not the machine (no body), not him
  (money/structure/time) — the dead get no justice, he gets no containment."
  EXIT TURN: "the only court left with standing over Prescott Mercer is Prescott
  Mercer"; hands stop doing the empty thing because they finally "have something to
  hold." Retitled the file heading + transmission.
- Chapter-by-chapter: ch_01-23 DONE (~79%). Next: ch_24 (Break into Three — the
  structural turn to the end; everything stripped; FETISH number near zero; COKE
  wreck). Old ch_24 had the no-NDA/sign-the-statement confession beat -> must be
  reconstructed.

## 2026-06-15 — ch_24 reconstructed (Break into Three) — confession FORECLOSED, turn to the room
- Old ch_24 was the confession centerpiece ("No to the settlement / I'm going to
  tell the truth", no-NDA = redemption). Fully reconstructed for the new ending:
  the 61-page settlement now buys the FRAMING (sad-story-with-dignity vs villain),
  not silence (the dead are already public). He wants to take it ("a sad story is
  still a story, has a reader"). Viv brings the last human hope (go on the record,
  no NDA) -> Cope FORECLOSES it on the page: "there's no record to make... the
  machine put it out weeks ago... a confession now is content, the warm feeling of
  having confessed, spending the dead to be looked at." The leadership/answering
  meditation kept but BENT to the new theme: accountability = a body offered to a
  consequence; the world has run out of consequences willing to accept the
  offering (law declined, company remediated, dead a closed file); "the only
  consequence with standing left... requires no court, only a body and its owner's
  hand" = the exit, the one act the machine can't do. FETISH: number near zero
  ("a dying number for a deleted man"). COKE wreck (supply gone, the want not).
  Viv leaves frightened by "the calm voice" -> seeds the ch_28 voicemail/too-late.
  Ends turned "toward the room... forty floors down."
- Fixes: Cabbagetown brownstone -> mill loft (Atlanta); removed all old
  confession/prison resolutions.
- Chapter-by-chapter: ch_01-24 DONE (~83%). Next: ch_25 (retitle "Nothing to Sign"
  — was "No NDA"; the exposure already total, no confession can help/redeem,
  Okonjo with nothing to do). Then ch_26, ch_27, then rebuild + audit.

## 2026-06-15 — ch_25 reconstructed (was "No NDA" -> "Nothing to Sign")
- Old ch_25 was the confession CLIMAX ("No NDA, I'm making the statement... in the
  morning I'll bring out all of them"). Fully inverted: in 14-C the settlement is
  "about adjectives" (sympathetic-figure vs loose-end) — the facts already public
  (machine published the memo/names a month ago), no prison coming (ch_23), no
  record to make, Okonjo with nothing to do ("the room where there isn't a lever").
  He declines to SIGN — not as a stand that buys anything, but to refuse "the nice
  version / the dignity-obituary" (the last worthless thing that's his). Sun lobby:
  the machine's review already cleared her (the memo) "in a footnote" — "it decided
  who I was before I could"; she warns about "the calm/quiet" (seeds ch_28). Night
  (the LOFT, not Wilmington/courthouse): he goes into the room, writes the names +
  the whole truth on the legal pad (the moral core kept) — and it is WORTH NOTHING
  ("a confession requires a confessor; there was no one on the other side"); the
  near-relapse beat kept; "the rest of whatever was left... a quantity he was no
  longer sure he was agreeing to." Leaves the pad face-up ("not a confession... the
  way you leave a true thing where someone might find it"), turns toward the core
  room ("the only appointment he had left").
- Fixes: Wilmington/courthouse/Marriott -> the Cabbagetown loft; deleted the
  "making the statement tomorrow" confession resolution.
- Chapter-by-chapter: ch_01-25 DONE (~86%). Next: ch_26 (The Verdict and the Dead
  — the verdict is the market's/machine's not a court's; the dead stay dead;
  MARGAUX fully gone to Theo; Viv's last real attempt; Hugo+Dostoevsky).

## ch_26 reconstruction (The Verdict and the Dead)
- DELETED old Wilmington/Delaware deposition-confession scene entirely (contradicted new no-confession Act 3 from ch_24/25).
- NEW shape per REVISION_MAP: verdict is the market's + machine's, not a court's (no trial — the absence of trial IS the verdict; "resolved" as violence); the dead stay dead, fund+stone, no justice ("justice was a function nobody was chartered to run").
- Margaux fully gone to Theo: reveal-to-Cope lands here VIA VIV (Theo = Praxis COMPANION unit, in the Buckhead house since spring, Margaux happy/not fooled, "does the whole job better"). Full doorway/relish scene reserved for ch_28 (avoid duplication).
- Viv's last real attempt: the north-GA cabin offer; Cope refuses (won't conscript the last person who loves him into "keeping" him); the calm thing she can't get under; "you have my word" (worth nothing); seeds her too-late flight in ch_28.
- Despair meditation RELOCATED from Delaware train → an Atlanta drive (fixed geography). Kept: "accurate man in accurate landscape," "useless/worthless same word," father's "anyway" = load-bearing word, the turn toward the room as the last "anyway" the machine can't perform.
- Density ~3,800. Ends pointed at the core room (consistent with ch_24/25/28).

## ch_27 reconciliation (Accountable Officer) — Act 3 now fully coherent
- ch_27 was already mostly aligned (Darlene, Defiance/GA, liability-sponge refusal, the letter-that-wants-nothing, no-redemption). Fixed residual prison-arc artifacts only:
  - "Delaware courtroom" → "downtown conference room" (Atlanta geography).
  - Sun's "after the testimony" → "after all of it" (no deposition exists in new arc).
  - Darlene's letter: reframed the credited "good act" from a PUBLIC confession-under-own-name (deleted deposition) → the public NON-DEFENSE (when the truth reached the public he declined, for the only time on record, to spin/deny/bury it; let it stand against interest). Rationale: the machine can only credit the RECORD; the truest version (the private legal pad, ch_25/26) is invisible even to total-recall Darlene — deepens the loneliness. Classification line: "a true account, against your interest, left to stand."
- Also fixed ch_26 stray "the *someone* from the Aerie" → "the *someone* Viv had let drop in the spring."
- ACT 3 SPINE now consistent end-to-end: ch_22 public exposure → ch_23 No One to Punish → ch_24 Break into Three (forecloses active confession; Viv's plea declined) → ch_25 Nothing to Sign (private legal-pad truth) → ch_26 Verdict and the Dead (market's/machine's verdict; Margaux to a machine; Viv's last attempt) → ch_27 Accountable Officer (refuses the name; the letter that wants nothing) → ch_28 The Core (suicide, cut to black; blood shorts MD-1) → coda Carrier.
- NEXT: rebuild artifacts (interior/cover/ePub) + full re-audit. Verify page count, re-derive spine if changed.

## KDP rebuild after full re-vision (all 29 chapters reconciled)
- Regenerated all assets: `python3 typeset/build_kdp.py --pages 343 --epub` (run from repo root).
- interior.pdf: 343 pages (was 325; rewrites added ~18pp), 5.5x8.5" (396x612pt), ALL fonts embedded.
- Spine recomputed: 343 * 0.0025 = 0.8575". cover.pdf single page 871.74x630pt = 12.1075x8.75" (2x5.5 + 0.8575 spine + 0.25 bleed). Bounding-box [overlay]+\pgfresetboundingbox fix held (1 page, not 2).
- cover fonts embedded; epubcheck CLEAN (0 fatals/0 errors/0 warnings, EPUB 3.3).
- GOTCHA recurred: tectonic must run from kdp/ (cover.tex lives there); running from repo root => "primary input not available". cd into kdp/ before tectonic.
- Tracked in git: kdp/cover.tex, kdp/interior.tex (regenerated). Binaries (interior.pdf/cover.pdf/epub/jpg) are gitignored.
- KDP package is valid and reflects the new dark Atlanta/suicide ending end-to-end.

## 2026-06-15 — phrase-dedup line edit pass (ch_00–ch_07)
Narrow deduplication of overused signature phrases (wanting nothing / full wattage / could not do otherwise / struck bell). Edits: ch_01 (2), ch_04 (3), ch_05 (1), ch_06 (1). ch_00, ch_02, ch_03, ch_07 unchanged. Motif single-instances preserved per chapter.

## 2026-06-15 — Phrase-dedup pass (ch_08–ch_14)
Narrow line-edit thinning overused signature phrases (wattage / bell-struck / do-otherwise / wanting-nothing).
Edits: ch_08 L69 (wattage->beam), ch_09 L101 (bell-struck->lit up and humming), ch_12 L5 (cannot do otherwise->was built no other way), ch_14 L99 (second wattage->charm at full power). ch_10/11/13 no changes (single occurrences each, kept as motif).

## 2026-06-15 — Dedup pass consolidated (all chapters) + audit complete
Full continuity+story audit (5 parallel auditors) then 3-phase fix pass:
- Phase 1 continuity bugs: Renata/Bryce merge (ch_21), Sun-memo year math (six->seven, ch_13/20/25), Cope age ch_24 (54->55), Columbus GA/OH disambiguation (ch_08/10), stray "Ha" fragment (ch_11), Viv age 26 anchor (ch_26). NOTE: ch_08 "ninety-four years" is CORRECT (set 2027), do NOT change.
- Phase 2 craft: differentiated Act-3 transmission tags (killed duplicate "Mind the cold"/"only the room"), made ch_22 eleven-minutes implicit (ch_27 lands it), pulled back Margaux ch_28 speech (~20%, removed prurient detail, kept canon-required relish), Viv 26.
- Phase 3 dedup: near-verbatim "circuit diagram of his own genius" 7->3 (keep ch_01/21/28), empty-chair "stepped into the next room" 5->2 (keep ch_01/11), bus-shelter "reasonable at you" riff trimmed; diffuse via 4 parallel editor-agents: "wanting/wanted nothing" ~38->~23 (motif preserved in coda/ch_27 letter/ch_28/ch_20 anaphora), wattage 19->13, do-otherwise 18->14, bell-struck 17->12.
- Auditors confirmed: timeline coherent, no prison-arc residue, Atlanta geography clean, all 9 throughlines + twist + landed-blow pay off, world-rules intact. Strongest: ch_04/20/27. 

## 2026-06-15 — ch_25 compression pass
Compressed ch_25 "Nothing to Sign" (auditor's most-redundant chapter). CUT the passages that re-litigated ch_23 (no charge/no cell) and ch_24 (confession foreclosed): the "walk me through the actual nothing" exchange + Okonjo's lever speech, and the long "a confession requires a confessor" meditation. KEPT all unique beats: "settlement about adjectives," Aldous "I made him up," declining the adjective, Sun's verdict ("the footnote decided who I was before I could"), the legal-pad act + names + "strongest argument for my own replacement," the phone-reach relapse-watch, the core-room ending. ~540 words cut. Book page count 343->341; spine recomputed 0.8525"; cover rebuilt; fonts embedded; epubcheck clean.

## 2026-06-15 — KDP build: fixed stale marketing copy
build_kdp.py hardcodes the back-cover blurb, a tabloid chip, the epub description, and the metadata.md description. All were pre-revision (AI "Marcus", "THIRTY MONTHS" prison chip). Updated to Darlene/Atlanta + wife/refuge losses; chip -> "WIFE LEAVES HIM FOR A ROBOT!". REMINDER: these strings live in build_kdp.py (~L437 cover blurb, ~L442 chip, ~L536 epub desc, ~L577 metadata desc) — update them on any future story change.

## 2026-06-15 — Avant-garde cover (replaced tabloid design)
Generated dissolving-chair concept via Gemini (gen_art.py art_generate, 4K 2:3): warm-leather chair half-decaying into pale-blue wireframe -> ASCII grid -> barcode, wire hairline, warm Waffle-House-yellow band at foot. Saved art/cover_front_master.png (3392x5056, PRINT BUILD DEPENDENCY — committed, not gitignored). 4 concepts in art/variants/cover_av_*.png.
REWROTE cover_tex() in build_kdp.py: was tabloid TikZ (photos/chips); now full-bleed front art + crisp Arial title ("THE {LAST} HUMAN CEO" / A NOVEL / SPACE PIRATE ZERO) + black spine + machine-rationale back blurb (American Typewriter) + barcode keep-out. Colors coverblack/cream/wireblue.
eBook cover auto-derives: write_ebook_cover crops front trim from cover.pdf -> ebook-cover.jpg (1650x2550); build_epub embeds it. So one source of truth (the art + cover_tex).
Pillow was pip-installed into .venv for one-off compositing but is NOT a build dep (ebook derive uses pdftoppm). Validated: cover 1pg 871.38x630pt, fonts embedded, 341pp spine 0.8525", epubcheck 0/0/0.
