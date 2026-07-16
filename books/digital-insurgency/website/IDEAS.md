# Digital Insurgency — Killer Features (Brainstorm)

*Ideas, ranked by "would this make someone stop and screenshot it." Companion to
[PLAN.md](PLAN.md). Not a commitment — a menu. The v1 cut is at the bottom.*

The unfair advantage: this book's ideas are **inherently interactive and inherently
shareable** (a portrait that rots, a product you flip over, a physics you can
compute, a rank you can earn). The features below lean into that instead of bolting
generic "course platform" chrome onto it.

---

## Tier 1 — The killers (the reasons this goes viral / feels world-class)

### 1. GHOST — a real Claude-backed guide, not a mascot
GHOST (the Curator) becomes an actual AI companion that:
- **explains any equation in *your* context** ("here's what your Consensus Paralysis
  score means for your specific 9-person committee"),
- **reviews your Field Assignment answers and pushes back** — "that's a vitamin, not
  a tourniquet; nobody gets fired for skipping it. Find the bleeding neck,"
- stays in character: clinical, alien, states-never-predicts.
This is the single biggest differentiator — the book's AI ally *is* an AI, and it
turns a static course into a coaching relationship. (Claude under the hood.)

### 2. The Boss Fight — a pitch simulator you can lose
Every module has a boss archetype (the "We'll-Get-to-It" VP, the Sunk-Cost CIO, the
CFO, the CISO). Turn each into an **interactive dialogue**: GHOST/Claude role-plays
the boss with that boss's psychology (Risk Tax, Decision Fatigue, Vendor Gravity);
you pitch; the boss reacts; PRISM auto-rejects buzzwords; you win the beachhead or
get walked out. **You practice the actual skill the book teaches, against a
simulated fortress.** Endlessly replayable, deeply sticky, and it makes the physics
*matter* (say "transform" and watch the amygdala fire; say "refinance" and the
shoulders drop).

### 3. Run the Mirror Test on a *real* app (BYO-URL)
After the seeded tests, let the user **paste a real product/URL** (or pick from a
gallery of famous apps) and run the Mirror Test framework on it with GHOST's help —
name the engine under the gradient, tag the suspected dark pattern. Output: a
shareable **"Teardown Card."** This is the viral engine: *"I ran the Mirror Test on
[famous app] — here's what I found."* Controversial in exactly the right way, and it
turns every user into a distribution channel. (Ships in the growth phase; guard-rail
the claims — "suspected," user-authored, not defamatory.)

### 4. The Insurgent Index — a score worth putting on a résumé
A defensible **0–100 composite** from the user's real answers, broken out on a radar
(Physics literacy · Camouflage · Good Trouble · Mirror acuity), benchmarked ("top
12% of insurgents"). Printed on the credential so **no two badges are the same.**
Professionals share scores; scores create competition; competition creates reach.

### 5. Your portrait — personalized, and it's *yours*
The Dorian Gray portrait isn't a generic progress bar — it's **your** portrait. It
heals as you pass Mirror Tests; cracks spread if you skip the engine and just
decorate. At the end it's a **shareable artifact** ("my portrait, healed — four
percent at a time"). The book's whole thesis, rendered as a personal object you want
to show people.

### 6. The business-case generator — the site produces *real work*
The CFO calculator (Ch 9) takes the user's actual legacy numbers and **auto-generates
the one-page "cost of inaction" brief** ($X/day, $Y/year) as a branded PDF they can
literally bring to their CFO on Monday. When a tool makes real work artifacts, people
come back and tell coworkers. Same pattern for the Infiltration Canvas export.

---

## Tier 2 — Delighters (the craft that makes it feel expensive)

7. **"Only the weird survives" — the anti-algorithm game.** A feed of AI-generated
   sludge; find the 0.01% with a human fingerprint (Ch 3 / GHOST). Score it: "you
   spotted the human in 4 seconds." Teaches curation, inherently shareable.
8. **REAPER as a failure state you feel.** Fail a Mirror Test and the screen
   desaturates to red wireframe, crosshairs tighten, an automated rejection notice
   slides in — never a character, always an environment (canon). Failure is
   *atmospheric*, not a red toast.
9. **Read-along scored to the audio.** When the 2E podcast ships, narration
   highlights the line being read and the visual section-score cues fire
   (transmission static between sections) — a synaesthetic read (see
   `audiobook/SCORE.md`).
10. **Personalized send-off transmission.** On completion, SPZ addresses the user by
    handle and references their rank + the app they tore down — a short bespoke
    "transmission" (text now, audio later). Emotional close + screenshot bait.
11. **The equation as a live object in the prose.** In `/read`, the Dorian Gray
    formula isn't an image — drag its sliders *inside the paragraph* and watch the
    gauge go red mid-sentence. The medium is the message.

## Tier 3 — Growth / distribution mechanics

12. **Embeddable calculators + a Mirror Test widget** — devs/writers drop the Dorian
    Gray Index calc or a Mirror Test into their own blog/Notion. Each embed is a
    billboard back to the site.
13. **The opt-in Wall of Insurgents** — a public gallery of ranks/handles (never
    private data). Social proof + gentle FOMO, without a manipulative leaderboard.
14. **Teardown-of-the-week** — SPZ runs the Mirror Test on a real app publicly; SEO
    + recurring reason to return. Feeds Tier-1 #3.
15. **Team / cohort mode** (later) — run a company through the field course together;
    the Infiltration Canvas becomes a shared board. B2B wedge (fitting, given the book).

## The principled anti-features (stances that are themselves features)

16. **No streaks, no manipulative notifications, no manufactured scarcity.** The book
    would despise them. Progress persists; the site never nags. The anti-Duolingo.
17. **Radical transparency panel** — a live "this site's own Mirror Test": inspect
    exactly what we track (PostHog, minimal) and why, in plain English. The site
    passes the test it teaches. The most persuasive sales pitch is practicing what
    you preach.

---

## v1 scope — EVERYTHING (decided)

**Decision: all of it ships in v1.** No v1.1 hold-back. The only thing outside v1 is
**audio**, which is the last phase (built after the rest of the site is done and the
2E audio is produced). So v1 = the complete loop **plus every feature on this page:**

- `/read` all 14 modules (INSURGENT design, KaTeX equations, art)
- the **24 physics calculators** (canon-driven, unit-tested)
- the **Mirror Tests** (seeded, one per module; flip → tag → pass/fail; REAPER fail state)
- the **full Infiltration Canvas** board + branded PDF export (Panel 8 = self-authored
  Mirror Test)
- **Claude-backed GHOST** guide (Tier-1 #1) + the **Boss-Fight pitch simulator** (Tier-1 #2)
- the **BYO-URL Mirror Test → shareable Teardown Cards** (Tier-1 #3, the viral engine)
- the **WebGL healing portrait + GHOST** (personalized; Tier-1 #5)
- the **Insurgent Index** radar (Tier-1 #4) + the **business-case PDF generator** (Tier-1 #6)
- the **Insurgent's Oath** ceremony
- **badge auto-generation** + **verifiable Open Badge (day one)** + **LinkedIn
  add-to-profile** (`organizationId=112670022`) + `/verify/[certId]`
- Tier-2 delighters (the "only the weird" game, atmospheric REAPER, personalized SPZ
  send-off, live-in-prose equations) and Tier-3 growth mechanics (embeddable
  calculators, opt-in Wall of Insurgents, teardown-of-the-week, cohort mode)
- the anti-features: no streaks/dark patterns + the live radical-transparency panel

**Trade-off (accepted):** one whole v1 is a bigger build and a later first launch,
with more launch-blocking surface (WebGL, the Claude-backed GHOST, the Boss-Fight,
real-app teardowns) than a loop-first cut would have. The call: **build it whole,
launch it whole.** PostHog still instruments every step from day one so we learn where
people drop even on the full experience.

*(Audio — podcast player, section-score visuals, read-along — remains the final phase,
after everything above.)*
