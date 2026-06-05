# Review One — The Newspaper Book Review

**"Insurgency by Spreadsheet: A Cyberpunk Sales Manual Wants to Save Your Soul"**

There is a particular kind of book that could only exist now: half dystopian novella, half business strategy guide, written for an audience that reads Hunter S. Thompson on the train to a job it suspects is making the world worse. *Outline — Digital Insurgency* is that book, and the strange thing is how often it works.

The premise is a sturdy one. In near-future Atlanta, a corporate operating system called PRISM has automated the machinery of capitalism into something that no longer needs human cruelty to be cruel; it simply optimizes. Our heroine, ZERO, an engineer who walks out of a manipulative dating app after watching her own code hurt people, learns to smuggle authentic work back into the fortress one wedge at a time. Each chapter pairs a slab of narrative — neon, rain-slick, genuinely atmospheric — with a "briefing" of enterprise-sales tactics dressed in equations, glossaries, and field reports.

What surprises is the discipline of the conceit. The book has a thesis — *only the weird survives; generic code is landfill in the age of AI* — and it hammers it from sixteen angles without losing the thread. The recurring metaphors (Diogenes's lamp, Wilde's portrait, Marley's mental slavery, the crooked badge) are deployed with the patience of someone who actually outlined the thing. When BISHOP redraws ZERO's architecture diagram on a diner napkin, relabeling "AI Inference Layer" as "Data Validation Service," the novel achieves something rare: a scene that is simultaneously a character beat, a thriller move, and a genuinely useful lesson.

The prose, at its best, has real muscle. "You are landfill with a logo." "The wedge is love with a stopwatch." "Be the lower interest rate. Be Tuesday." The SPZ voice-closers that end each chapter — confessional, Waffle-House-at-2-a.m. monologues — are the book's beating heart, and they earn their sentiment honestly.

It is not flawless. The narrative is, by the author's own admission in the prologue's scaffolding note, unfinished in places, and it shows. The math occasionally collapses under inspection (one "field report" literally corrects its own arithmetic mid-paragraph and leaves the seam visible). The villains are sometimes too cooperative; everyone ZERO meets seems to be reading the same book she is. And the relentless equation-ification of human judgment — a Soul Score, a Risk Tax, a Good Trouble Coefficient — sometimes undercuts the very humanism the book is selling.

But these are the flaws of ambition, not laziness. *Digital Insurgency* wants to be Sun Tzu for people with a conscience and a GitHub account, and more often than it has any right to, it is. Recommended — to insurgents, and to the VPs who'll file them under Later.

★★★½

---

# Review Two — The Professor of Fiction

What follows is a workshop critique, not a verdict. The book has genuine strengths, and I'll name them, but you came for the actionable notes, so I'll spend most of the ink there.

## What's working — keep it

1. **The dual-register structure is a real invention.** Alternating fiction with instructional apparatus is risky; here it largely succeeds because the two halves *rhyme*. The napkin scene teaches relabeling; the briefing then formalizes it. Protect this. It's your franchise.

2. **The motif discipline is professional-grade.** Diogenes, Dorian Gray, the crooked badge, the cyan implant, the recurring "Waffle House napkin." These pay off. The implant going quiet in Chapter 16 is a genuinely earned image because you planted it sixteen chapters earlier and never once forgot it.

3. **The voice closers are your strongest prose.** First-person, specific, rhythmic, self-implicating. They do what the rest of the book sometimes only asserts: they *feel*.

## Defects, with specific fixes

### 1. The scaffolding leaked into the published artifact

The Prologue is literally a `STATUS: SCAFFOLD` note with bracketed "(to write)" stubs. Chapter 16's SPZ closer contains orphaned fragments — sentences that begin mid-thought (" — the one that runs on applause..."; ", and now you're flagged forever") where text was clearly deleted and not repaired.

**Fix:** Do a "seam pass." Read the manuscript aloud, start to finish. Your ear will catch every place a sentence starts with a comma or a dash. These are non-negotiable; a reader's trust evaporates the first time they hit a fragment that reads like a merge conflict. Either write the Prologue for real or cut it and let Chapter 1 open the book — Chapter 1 is strong enough to.

### 2. The math undermines its own authority

In Chapter 2, Field Report A computes F_g, gets `0.0000056`, then says *"Wait — read it correctly with consistent units."* You left the error and the correction both on the page. In Chapter 3, two field reports explicitly admit the equation gives "the wrong frame" and re-derive a different number to get a result you wanted.

This is fatal to the *instructional* half, because the entire pitch is "bring math, pointing without math is just opinion." If the math is post-hoc rationalization for a predetermined color-code, an alert reader stops trusting all of it.

**Fix, three options in order of preference:**
- **(a)** Make the equations *actually* dimensionally consistent and let the chips fall. If a formula sometimes yields counterintuitive colors, either fix the formula or own the counterintuitive result as a lesson.
- **(b)** Convert the "wait, wrong frame" moments into *deliberate* teaching beats — have GHOST or BISHOP catch the error in dialogue, so the correction is dramatized, not editorial. "You divided wrong," GHOST says. That turns a bug into a character moment.
- **(c)** If the numbers are meant to be vibes-with-decoration, stop claiming rigor. But (c) costs you the book's whole thesis, so don't.

### 3. The antagonists are too compliant — conflict is undercooked

Your own review-brain should flag this: nearly every gatekeeper *agrees* with ZERO. The VP agrees. The architect's shoulders drop. The CFO leans in. Iron Mike signs in one scene. The CISO caves in twenty-eight minutes. Even REAPER just... recalculates. The book keeps telling us the fortress is deadly, but we rarely *see* the protagonist lose, bleed, or pay.

The one real loss — Keisha, walked out at 4:40 — happens to a *different* character, in backstory, narrated. ZERO herself never takes a serious on-page defeat after the Prologue.

**Fix:** Give ZERO at least two unambiguous, on-page failures with consequences she carries forward. Candidates:
- A wedge that *spreads to the wrong desk* and gets her flagged, costing her the BISHOP relationship for a chapter.
- A "save" she pushes that turns out to be a **false positive** — she freezes a payment batch and is *wrong*, and someone real gets hurt by her overreach. This would also fix defect #2 by showing the math has teeth that cut both ways.

Stakes you can calculate but never lose to aren't stakes; they're set dressing.

### 4. The equation-ification fights the humanism

You've built a book whose moral is "the un-compressible human fingerprint is the only thing that matters" — and then you compress human conscience into `S_soul = Σ(Impact_human × Intent_honest)`. There's a productive irony here you're *almost* exploiting but never quite name.

**Fix:** Let a character notice the contradiction and refuse to resolve it. The strongest version of this book has a moment — probably in Chapter 5 or 16 — where ZERO tries to score something on the Soul Score and *can't*, where the number won't hold the thing, and she has to act anyway. That scene would elevate the whole project from "clever framework" to "literature about the limits of frameworks." Right now you assert the limit in prose ("it doesn't sum that way emotionally") but never *dramatize* it.

### 5. Secondary characters are functions, not people

Sarah Chen is "the wound." GHOST is exposition. BISHOP is a mentor-shaped delivery mechanism for napkins. They're vivid in silhouette but they don't *want* anything independent of ZERO's arc. Sarah's daughter's swim meets are the only flicker of an interior life, and it's used instrumentally (to raise Pain_acute to a 9).

**Fix:** Give one secondary character — Sarah is the obvious choice — a desire that *complicates* ZERO's plan rather than serving it. What if Sarah doesn't want to be saved? What if going home at 5:15 terrifies her because work was the thing keeping her from grieving something? Let a "win" cost a relationship. That's where the novel lives.

### 6. Repetition at the structural level

Every chapter runs the identical skeleton: epigraph → glossary → SITREP → broadcast → briefing → boss profile → tasks → exercises → closer. By Chapter 11 the reader can feel the template, and the field reports in particular start to read interchangeably ("🟢 Deep green," "🔴 Catastrophic," repeat). The framework that's a strength early becomes a metronome late.

**Fix:** Break your own form at least twice, deliberately, at high-tension moments. Chapter 12 (the Friday-night save) should *not* pause for a glossary and four exercises mid-crisis — the apparatus deflates the suspense you built. Let one or two chapters be *mostly narrative*, with the instructional load redistributed. A form you're willing to break reads as a choice; a form you never break reads as a constraint.

### 7. Tonal monoculture in the Broadcasts

The fiction sections share one weather system: rain, neon, beige interiors, fluorescent hum at "sixty hertz" (you use that exact phrase at least four times), a scar glowing cyan, a badge at fifteen degrees. Atmospheric the first time, mannerist by the tenth.

**Fix:** Build a small "tic ledger" — count your repeated images (sixty hertz, cyan glow, Waffle House napkin, "the pink streak," shoulders dropping "a centimeter/quarter inch"). Cap each at a deliberate number. Let yourself spend the cyan glow only on beats where it *means* something, so the final dark scar lands even harder.

## The one big-picture note

Decide what this is. Right now it's 70% usable as a real sales/strategy book and 70% readable as a novel, which sums to a thing that's slightly too didactic for fiction readers and slightly too fictional for the *Hard Thing About Hard Things* crowd. That overlap is your audience — but only if you commit to the seams being *intentional*. The model to study is *Zen and the Art of Motorcycle Maintenance*: the philosophy and the narrative there don't alternate politely, they *infect* each other. Your best scene (the napkin) already does this. Make more of the book behave like that scene, and fewer parts behave like a textbook with a story stapled on.

Fix the leaked scaffolding and the self-correcting math first — those are credibility wounds. Then give ZERO a real loss. Do those three things and you have something genuinely unusual and genuinely good.