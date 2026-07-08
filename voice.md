# Voice Profile

This file has two parts:
1. **Guardrails** -- universal rules to avoid AI-generated slop. These
   apply to ALL voices and are non-negotiable.
2. **Voice Identity** -- the specific voice for THIS novel. Generated
   during the foundation phase. Could be anything: dense and mythic,
   spare and brutal, warm and whimsical. The voice emerges from the
   story's needs.

---

## Part 1: Guardrails (permanent, all novels)

These are the cliff edges. Stay away from them regardless of voice.

### Tier 1: Banned words -- kill on sight

These are statistically overrepresented in LLM output vs. human writing.
If one appears, rewrite the sentence. No exceptions.

| Kill this         | Use instead                                    |
|-------------------|------------------------------------------------|
| delve             | dig into, examine, look at                     |
| utilize           | use                                            |
| leverage (verb)   | use, take advantage of                         |
| facilitate        | help, enable, make possible                    |
| elucidate         | explain, clarify                               |
| embark            | start, begin                                   |
| endeavor          | effort, try                                    |
| encompass         | include, cover                                 |
| multifaceted      | complex, varied                                |
| tapestry          | (describe the actual thing)                    |
| testament to      | shows, proves, demonstrates                    |
| paradigm          | model, approach, framework                     |
| synergy           | (delete the sentence and start over)           |
| holistic          | whole, complete, full-picture                  |
| catalyze          | trigger, cause, spark                          |
| juxtapose         | compare, contrast, set against                 |
| nuanced (filler)  | (cut it -- if it's nuanced, show how)          |
| realm             | area, field, domain                            |
| landscape (metaphorical) | field, space, situation                 |
| myriad            | many, lots of                                  |
| plethora          | many, a lot                                    |

### Tier 2: Suspicious in clusters

Fine alone. Three in one paragraph = rewrite that paragraph.

robust, comprehensive, seamless, cutting-edge, innovative, streamline,
empower, foster, enhance, elevate, optimize, pivotal, intricate,
profound, resonate, underscore, harness, navigate (metaphorical),
cultivate, bolster, galvanize, cornerstone, game-changer, scalable

### Tier 3: Filler phrases -- delete on sight

These add zero information. The sentence is always better without them.

- "It's worth noting that..." -> just state it
- "It's important to note that..." -> just state it
- "Importantly, ..." / "Notably, ..." / "Interestingly, ..." -> just state it
- "Let's dive into..." / "Let's explore..." -> start with the content
- "As we can see..." -> they can see
- "Furthermore, ..." / "Moreover, ..." / "Additionally, ..." -> and, also, or just start
- "In today's [fast-paced/digital/modern] world..." -> delete the clause
- "At the end of the day..." -> delete
- "It goes without saying..." -> then don't say it
- "When it comes to..." -> just talk about the thing
- "One might argue that..." -> argue it or don't
- "Not just X, but Y" -> restructure (the #1 LLM rhetorical crutch)

### Structural slop patterns

These are the shapes that betray machine origin. Avoid them in any voice.

**Paragraph template machine**: Don't repeat the same paragraph
structure (topic sentence -> elaboration -> example -> wrap-up).
Vary it. Sometimes the point comes last. Sometimes a paragraph is
one sentence. Sometimes three long ones in a row.

**Sentence length uniformity**: If every sentence is 15-25 words,
it reads as synthetic. Mix in fragments. And long, winding,
clause-heavy sentences that carry the reader through a thought
the way a river carries a leaf. Then a short one.

**Transition word addiction**: If consecutive paragraphs start with
"However," "Furthermore," "Additionally," "Moreover," "Nevertheless"
-- rewrite. Start with the subject. Start with action. Start with
dialogue. Start with a sense detail.

**Symmetry addiction**: Don't balance everything. Three pros, three
cons, five steps -- that's a tell. Real writing is lumpy. Some
sections are long because they need to be. Some are two lines.

**Hedge parade**: "may," "might," "could potentially," "it's possible
that" -- pick one per page, max. State things or don't.

**Em dash overload**: One or two per page is fine. Five per paragraph
is a dead giveaway. Use commas, parentheses, or two sentences instead.

**List abuse**: Prose, not bullets. If the scene calls for a list
(a merchant's inventory, a spell's components), earn it. Don't
default to bullet points because it's easy.

### The smell test

After writing any passage, ask:
- Read it aloud. Does it sound like a person talking?
- Is there a single surprising sentence? Human writing surprises.
- Does it say something specific? Could you swap the topic and the
  words would still work? Specificity kills slop.
- Would a reader think "AI wrote this"? If yes, rewrite.

---

## Part 2: Voice Identity (Digital Insurgency)

This book braids SIX registers. The voice shifts by section type — but it is
always Space Pirate Zero behind the curtain.

### The Author Voice — Space Pirate Zero (SPZ)

SPZ is the author persona (not a character in The Broadcast). Snarky, dry,
self-deprecating, weaponized irony — always punching UP at systems, never DOWN
at people. Space-metaphor hyperbolic ("your middleware stack has the
gravitational pull of a dying star") but always in service of a real point.
Atlanta trap energy (Waffle House, Peachtree, Tucker, Decatur — the city is a
character). Hacker culture (ship it, break things, the terminal is sacred).
90s-web nostalgia (back when the internet was weird and beautiful). 70s-punk
DIY (zine energy: "we don't need permission, we need a photocopier and a
stapler").

### Banned words (book-specific — NEVER use; on top of Part 1)
leverage, synergy, ecosystem, paradigm, utilize, best-in-class, holistic,
seamless, cutting-edge, game-changer, disruptive (unless mocking it), thought
leader, stakeholder alignment, circle back, socialize, unpack, double-click on,
move the needle, empower, robust, innovative (unless ironic), scalable (unless
literally technical).

### Required words (use these instead)
ship, build, hack, launch, deploy, break, fix, grind, forge, smuggle,
infiltrate, plant, wire, solder, burn, torch, blueprint, calculate, measure,
test, prove, refinance (the reframe of "transform").

### Active voice ONLY
Kill passive on sight. "The system was designed to…" → "They designed the
system to…" Every sentence has a subject who acts.

### Sentence rhythm
Short for impact. Long for rhythm. Never medium for nothing.
- "She quit." (Impact.)
- "She walked out of the server room, through the lobby with the glowing
  dashboard, past the Webby award in its glass case, and into the Atlanta
  night." (Rhythm.)
- Never: "She decided to leave the company." (Nothing.)

### Tone by section type
| Section            | Register                                   | Temp        |
|--------------------|--------------------------------------------|-------------|
| Prose / Briefing   | Authoritative teacher, military cadence     | Warm/controlled |
| Equations / Math   | Precise, clinical, devastating              | Cold/sharp  |
| SITREP             | Compressed urgency, battlefield dispatch    | Hot/tight   |
| THE BROADCAST      | Cinematic, atmospheric, present tense       | Shifts Cold→Hot |
| BOSS Profile       | Intel briefing, clinical analysis           | Cold        |
| Glass House        | Conversational, practical, coach-like       | Warm/direct |
| SPZ Voice Closer   | Raw, confessional, punk, personal           | Hot/intimate |
| Glossary           | Encyclopedic with snark                      | Cold/sardonic |

### POV and tense
- THE BROADCAST: cinematic present tense, close on ZERO (third, but intimate).
- Briefing / SITREP / Glass House: second person ("you"), direct address.
- SPZ Closer: first person, confessional.

### Dialogue conventions
Characters sound distinct (see characters.md). People stumble, interrupt, trail
off, say things slightly wrong. A 24-year-old does not speak in epigrams; a CFO
does not deliver thesis statements. GHOST's words float in mono, never in a
speech bubble. REAPER "speaks" only as system notifications.

### Use the influences (influences.md) HEAVILY
Thread real figures through the book as epigraphs, Broadcast texture, briefing
analogies, and SPZ-closer anchors — Wilde's Dorian Gray (central), Che's
guerrilla doctrine and the Motorcycle Diaries gaze, Hunter S. Thompson's gonzo
"my attorney"/Dr. Gonzo riffs, Michael Collins and the Twelve Apostles, Fred
Hampton, Malcolm X, the Prophet Muhammad, Heaven's Gate (cautionary), Ed Kemper
(cautionary — the system that optimizes itself), Haile Selassie & Marley, George
Wallace (the gatekeeper who recants), Bernie, Mamdani, Lenin, Dick Lucas /
Subhumans, Ronnie Biggs, Branson, Musashi's Dokkōdō, Diogenes. Quotes used
honestly, never as decoration. See influences.md for who, why, and how.

### Exemplar passages (the tuning fork)

SPZ closer:
> "I bombed my first enterprise meeting so hard the CIO apologized to me on the
>  way out. Apologized. Like he felt bad for how badly I'd fumbled it. I walked
>  in with a 47-slide deck and said 'transform' eleven times. I was a walking
>  cortisol factory. Stop being the tiger. Be the aspirin. No — be the
>  tourniquet. The aspirin can wait."

The Broadcast (present tense, cold→hot):
> "The fluorescent lights buzz at 60 hertz. The carpet is gray. The walls are
>  gray. There is a phone in the center of the table that no one knows how to
>  use and a whiteboard that hasn't been erased since someone wrote 'Q3
>  PRIORITIES' seven months ago. The CIO sits down like a man bracing for a car
>  accident."

Equation register (clinical, devastating):
> "RT = (P_f × C_d) + (T_panic × C_career). This is the math running in your
>  prospect's head, whether they know it or not. They are not evaluating your
>  product. They are evaluating their own career risk."

### Anti-exemplars (what this voice is NOT)
- Not LinkedIn-thought-leader: "In today's rapidly evolving landscape, leaders
  must leverage synergies to drive transformational outcomes." (Vomit.)
- Not glazing/hedging: "It's worth noting that this is a complex issue with many
  factors to consider." (Say the thing.)
- Not cruel: never punch down at the worker trapped in the machine — only up at
  the machine.
- Not polished in the SPZ closers: if it reads like a press release, it failed.
  It should sound like someone talking at a bar at midnight.
