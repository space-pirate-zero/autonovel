# -*- coding: utf-8 -*-
"""
Authored content for the 30-day Digital Insurgency Substack series.
build_cards.py renders the hero cards; build_posts.py assembles the .md drafts;
push_substack.py creates the Substack drafts. Edit the buy links once the book
is live on Amazon (placeholders below).
"""

BUY_KINDLE = "{{KINDLE_URL}}"        # TODO: real Amazon Kindle link once live
BUY_PAPERBACK = "{{PAPERBACK_URL}}"  # TODO: real Amazon paperback link once live
SUBSCRIBE = "{{SUBSCRIBE_URL}}"

# eq = inner LaTeX (display). None => title-only card.
SERIES = [
 dict(n=1, title="The Rewrite", source="Chapter 1 — the manifesto", eq=None,
   nugget="In the next 24 months AI will rewrite more software than humans wrote "
   "in the last 24 years. Not incrementally — categorically. The doom-criers miss "
   "the twist: AI eats *generic* software and makes *authentic* software more "
   "valuable than ever. The scarce thing was never code. It's taste — deciding "
   "what *should* exist, not what *can*. This series is 30 days of the physics "
   "that decides which side of that line your work lands on.",
   closer="Diogenes the Cynic lived in a barrel and walked Athens at noon with a "
   "lit lamp, hunting one honest man. His actual oracle was two words: *deface the "
   "currency.* He stamped over the king's face on real coins to prove it was a "
   "story people agreed to believe. That's the whole job now. The corporate "
   "currency is bullshit — synergy, leverage, transformation. The machines mint "
   "infinite bullshit faster than you can. So stop competing on it. Stamp over it. "
   "Smuggle something real inside the counterfeit and hand it back. The machines "
   "are coming for the boring parts. Good. We're here for the parts that need a pulse.",
   teaser="Day 2: the Extinction Rate, run for real."),

 dict(n=2, title="The Extinction Rate", source="Chapter 1", eq=r"R_{ext} = \frac{Lines_{generic}}{Lines_{authentic}} \times AI_{velocity}",
   nugget="How fast a product gets regenerated out of existence. As AI velocity "
   "climbs, only the code carrying genuine human judgment survives. A CRUD form "
   "with a gradient has a near-infinite numerator — it's landfill the moment the "
   "tooling catches up. The defensible work is the weird work: the parts a model "
   "can't infer because they required a decision only you would make.",
   bench="🟢 < 1 · 🟡 1–5 · 🔴 > 5 (you're landfill). Worked: a generic dashboard, "
   "ratio ~10, velocity rising → 🔴, measured in months.",
   closer="Che Guevara didn't become a revolutionary in a library. He became one "
   "on a motorcycle, watching the suffering the system had optimized into the "
   "background. The seeing did it. Run R_ext on your own product today and you'll "
   "see the same way — the comfortable lie that you're safe because you ship, "
   "replaced by the cold number. It's not a death sentence. It's a map. The "
   "denominator is yours to grow. Go find the weird in what you build, and pour "
   "everything into it. Everything else is already gone; it just hasn't been told yet.",
   teaser="Day 3: how long is your half-life?"),

 dict(n=3, title="The Authenticity Half-Life", source="Chapter 1", eq=r"A_{hl} = \frac{Taste + Context + Craft}{Replicability}",
   nugget="How long before a model can replicate your work. High taste, deep "
   "context, real craft over how copyable you are. A listicle's half-life is "
   "minutes. A sommelier's palate, a surgeon's judgment, a designer's eye that "
   "knows *why* — those approach infinity, because the denominator never quite "
   "reaches them.",
   bench="🟢 long (years) · 🟡 weeks · 🔴 < 6 months. If your moat is a prompt, you "
   "don't have a moat.",
   closer="Miyamoto Musashi wrote the Dokkōdō — twenty-one precepts for walking "
   "alone — days before he died. One of them: *do nothing that is of no use.* That "
   "is the half-life test in four words. Most of what we ship is of no use except "
   "to look busy, and the machine will do busy for free. Spend your hours on the "
   "irreplaceable. Raise the numerator until copying you stops being worth it. "
   "That's not vanity. That's survival math.",
   teaser="Day 4: spotting innovation theater."),

 dict(n=4, title="The Theater Ratio", source="Chapter 2", eq=r"R_t = \frac{Press\_Releases + Demo\_Days}{Production\_Deployments}",
   nugget="Innovation theater, quantified. Count the announcements; count the "
   "actual deploys. A high ratio means a company that performs progress instead "
   "of shipping it. The Innovation Lab is a thermodynamic scam — heat in, zero "
   "work out. Find the team that deploys, not the one that announces.",
   bench="🟢 < 2 · 🟡 2–5 · 🔴 > 5 (all talk). Count their last quarter of both.",
   closer="Hunter S. Thompson said when the going gets weird, the weird turn pro. "
   "Theater is what the un-weird do when the going gets weird — they hold a summit, "
   "print a deck, ring a bell. The pros ship. I've sat in the strategy offsite "
   "where they workshopped the word 'bold' for forty minutes and shipped nothing "
   "for a year. Don't be impressed by the smoke. Ask one question: what went to "
   "production this month? The silence after that question is the most honest thing "
   "in the building.",
   teaser="Day 5: why you can't rip out Oracle."),

 dict(n=5, title="Vendor Gravity", source="Chapter 2", eq=r"F_g = \frac{Sunk\_Cost \times Political\_Capital}{Migration\_Effort^{2}}",
   nugget="Why you can't 'just switch.' The legacy system has its own gravitational "
   "field, and it's strongest where someone's reputation is staked to it. High "
   "gravity means a replacement pitch is dead on arrival — orbit it instead. Be a "
   "sidecar, not a rip-and-replace.",
   bench="🟢 < 20 (movable) · 🟡 20–80 · 🔴 > 80 (do NOT pitch replacement).",
   closer="Lenin: there are decades where nothing happens and weeks where decades "
   "happen. Gravity wells are the decades. You don't escape one by pushing harder "
   "against it — you wait, you attach, you accrete mass quietly until the day the "
   "well collapses under its own entropy and your little moon is suddenly the "
   "planet. Every insurgent I respect learned this the hard way: you cannot fight "
   "gravity with a slide deck. You fight it with patience and a foothold the "
   "system forgot to defend.",
   teaser="Day 6: the lie that the status quo is free."),

 dict(n=6, title="The Entropy Tax", source="Chapter 2", eq=r"E_{tax} = Maintenance \times e^{\lambda t}",
   nugget="The compounding cost of doing nothing. Software rots like a bridge, not "
   "like fruit — slowly, then catastrophically. The biggest lie in corporate "
   "finance is that the status quo is free. It isn't; it's a loan accruing "
   "interest in the dark while everyone admires the green dashboard.",
   bench="Read the curve, not a point: 🟢 flat · 🟡 bending · 🔴 hockey stick.",
   closer="Haile Selassie stood at the League of Nations in 1936 and told a room "
   "that wanted to look away: *it is us today. It will be you tomorrow.* They "
   "looked away. The entropy came for all of them. That's the tax. The bill you "
   "don't open keeps growing, and the longer you don't open it the more it "
   "compounds, until the day it isn't a line item anymore — it's the whole "
   "balance sheet on fire. Open the bill. Show them the curve. Doing nothing is "
   "the most expensive thing on the table.",
   teaser="Day 7: fear lives in the undocumented system."),

 dict(n=7, title="Legacy Friction", source="Chapter 2", eq=r"\mu_{leg} = \frac{Years\_Since\_Update}{Pages\_of\_Documentation}",
   nugget="How hard a system is to change, measured by its obscurity and the fear "
   "it generates. High friction — old and undocumented — is terrifying to "
   "everyone, which means it's your opening. Become the only person who actually "
   "understands it and you become load-bearing.",
   bench="🟢 low · 🟡 mid · 🔴 high (obscure + terrifying; nobody will touch it).",
   closer="Michael Collins beat an empire not with more men but with better "
   "information — he knew the system more intimately than the system knew itself. "
   "Friction is your intelligence war. The scary undocumented box everyone routes "
   "around is exactly where you plant your flag, because understanding is power and "
   "fear is just understanding nobody's bothered to acquire. Read the thing nobody "
   "will read. Map the thing nobody will map. Then the fortress has exactly one "
   "person it can't function without, and it's you.",
   teaser="Day 8: when the team is underwater."),

 dict(n=8, title="Technical Debt Compound", source="Chapter 2", eq=r"D_{comp} = \frac{Bugs\_Found}{Bugs\_Fixed}",
   nugget="When this crosses 1.0, the team is underwater — finding faster than "
   "fixing. Don't pitch efficiency to a drowning person. Be the bucket, not the "
   "blueprint. The drowning don't want a vision; they want air, today.",
   bench="🟢 < 0.8 · 🟡 0.8–1.0 · 🔴 > 1.0 (underwater).",
   closer="Bob Marley: emancipate yourselves from mental slavery; none but "
   "ourselves can free our minds. A team past 1.0 has been mentally enslaved by "
   "its own backlog — they've stopped believing the water level can go down. The "
   "first thing you give them isn't a roadmap. It's proof the level can drop, even "
   "an inch. One bucket. One fixed thing that stays fixed. Hope is a precondition "
   "for change, and you manufacture it with a single honest win, not a strategy deck.",
   teaser="Day 9: why committees are graveyards."),

 dict(n=9, title="Consensus Paralysis", source="Chapter 2", eq=r"F_{cp} = \frac{n(n-1)}{2}",
   nugget="Metcalfe's Law of friction. A 10-person meeting has 45 lines of "
   "tension. Every head you add multiplies paths to 'no' and adds none to 'yes.' "
   "Committees are graveyards. Keep the room small enough to fit a decision.",
   bench="🟢 ≤ 6 (n≤4) · 🟡 10–21 (n 5–7) · 🔴 > 28 (n ≥ 8).",
   closer="Bernie Sanders ran on three words for forty years: not me, us. People "
   "miss that 'us' is not the same as 'everyone in the room.' A movement is a small "
   "disciplined core plus a wide base — not a 12-person approval committee where "
   "everyone owns the veto and no one owns the outcome. If you want a decision, "
   "shrink the deciders and widen the beneficiaries. The graveyard is the meeting "
   "where everyone can say no and no one can say yes.",
   teaser="Day 10: taste is the new code."),

 dict(n=10, title="The Curator's Edge", source="Chapter 3", eq=r"V_{curator} = \frac{Signal_{selected}}{Noise_{available}} \times Context_{depth}",
   nugget="As noise approaches infinity — which it has — the value of selection "
   "explodes, but only if your context is real. AI made creation free, so creation "
   "is worthless as a differentiator. The scarce skill is judgment: saying *this "
   "matters and this doesn't,* and being right.",
   bench="Explodes as noise→∞ — only if Context_depth is real. 🔴 context≈0 = a listicle.",
   closer="Diogenes again, because he earned it twice. The lamp in daylight wasn't "
   "a stunt; it was a filter. He held light to faces and read what came back. "
   "That's curation — not making more, but holding the lamp steady while the world "
   "drowns in cheap light. The machines can paint a million paintings tonight. "
   "They can't hang the gallery. Be the one who walks the infinite feed and says "
   "*this one. Not that one.* That sentence is the whole job now, and almost nobody "
   "can say it with conviction.",
   teaser="Day 11: the currency of the future."),

 dict(n=11, title="The Authenticity Token", source="Chapter 3", eq=r"T_{authentic} = Trust_{human} \times \frac{1}{Substitutability_{AI}}",
   nugget="The currency of the future: trust issued by a human, divided by how "
   "easily AI can replace that human's judgment. A sommelier's pick is high. A "
   "'Top 10' blog is zero. AI can't be authenticated, so authenticity becomes the "
   "one thing that holds value when everything else is free.",
   bench="🟢 > 5 (irreplaceable) · 🟡 1–5 · 🔴 → 0 (AI-washable).",
   closer="Watch what Mamdani did. He didn't outspend the machine — he out-*realed* "
   "it. Clear message, relentless ground game, content that felt like a person "
   "instead of a focus group. Trust cranked to the ceiling, substitutability "
   "floored. The machine had more money. He had a higher T_authentic, and that "
   "won. Same physics applies to your product, your pitch, your career. You will "
   "not out-generate the generators. You out-real them. The fingerprint is the moat.",
   teaser="Day 12: you're selling to an amygdala."),

 dict(n=12, title="The Risk Tax", source="Chapter 4", eq=r"RT = (P_f \times C_d) + (T_{panic} \times C_{career})",
   nugget="The math running in your prospect's head, whether they know it or not. "
   "They aren't evaluating your features — they're evaluating their own career "
   "risk. If the panic-and-career term dominates, no upside will move them. Your "
   "job is to shrink that number, not inflate the benefit.",
   bench="🟢 < 100 · 🟡 100–1000 · 🔴 > 1000 (career risk > any upside; walk).",
   closer="Malcolm X taught himself by copying a dictionary, word by word, in a "
   "prison cell — because fear of staying who he was finally outweighed the fear "
   "of becoming someone new. That's the whole game. People don't move when the "
   "upside is big. They move when the risk of *not* moving finally feels bigger "
   "than the risk of moving. Stop selling the dream. Flip the cortisol. Make the "
   "status quo the scary option, and watch the no turn into a lean-forward.",
   teaser="Day 13: never pitch after lunch."),

 dict(n=13, title="Decision Fatigue", source="Chapter 4", eq=r"DF = \frac{Decisions_{made}}{Glucose_{remaining}}",
   nugget="Decision quality collapses after ~4 hours of deciding. By 2 PM the "
   "average exec has made 200 calls and defaults to the lowest-energy option, "
   "which is always 'no' or 'defer.' Never pitch after lunch. 'No' costs zero "
   "calories.",
   bench="🟢 before 11 AM · 🟡 post-lunch · 🔴 after 2 PM.",
   closer="Thompson again — the man understood that *when* matters as much as "
   "*what.* He filed the wildest copy at dawn after the all-nighter, not in the "
   "stale afternoon. Your brilliant pitch dropped into a 4 PM, post-lunch, "
   "tenth-meeting brain is a beautiful song played to a room full of people whose "
   "ears have already gone home. Get the morning slot. Bring literal glucose if "
   "you have to. This isn't a hack; it's respecting the biology of the only organ "
   "that can say yes.",
   teaser="Day 14: the portrait in the server room."),

 dict(n=14, title="The Dorian Gray Index", source="Chapter 5", eq=r"D_{gray} = \frac{Revenue_{dark\text{-}pattern}}{Trust_{eroded}} \times Time",
   nugget="The compounding cost of ethical shortcuts. Dark-pattern revenue grows "
   "linearly; trust erodes exponentially. Eventually the portrait — the rot in the "
   "server room — becomes visible all at once, and the company dies not from "
   "competition but from moral collapse.",
   bench="🟢 < 10 · 🟡 10–50 · 🔴 > 50 (the portrait is showing through the canvas).",
   closer="Oscar Wilde gave us the whole thing 130 years early. Dorian stays "
   "beautiful while the painting in the attic rots, and the prettier he stays the "
   "uglier it gets, because the beauty is what *funds* the rot. Your product is "
   "your portrait. Every manipulation you ship is a brushstroke on a face you have "
   "to meet in the mirror under the good bathroom lighting. The app stays gorgeous. "
   "You're the one who rots. I've watched it happen to good engineers. The number "
   "always comes due. Always.",
   teaser="Day 15: medicine or poison?"),

 dict(n=15, title="The Soul Score", source="Chapter 5", eq=r"S_{soul} = \sum (Impact_{human} \times Intent_{honest})",
   nugget="A brutally honest metric: for every feature, multiply human impact by "
   "the honesty of intent (+1 genuine, −1 exploitative). Most companies never "
   "calculate it because they're terrified of the number. The insurgent calculates "
   "it anyway, then decides what to build — and what to refuse.",
   bench="🟢 net positive · 🔴 net negative (fix the product before anything else).",
   closer="Heaven's Gate had a perfectly internally-consistent worldview. Matching "
   "uniforms, sealed logic, every member sincere. Sincerity is not the test. A "
   "system can be coherent, beloved by its own people, optimized to the decimal — "
   "and still march everyone off a cliff because nobody ran the soul score. If "
   "you're building something you wouldn't let your mom use without cringing, "
   "you're not an insurgent. You're a mercenary with a nicer UI. The Mirror Test "
   "is the first and last thing. Run it.",
   teaser="Day 16: build the kill switch first."),

 dict(n=16, title="The Reversibility Ratio", source="Chapter 6", eq=r"R_r = \frac{Impact_{blast}}{Speed_{rollback}}",
   nugget="The CIO's real question isn't 'will it work?' but 'what happens when it "
   "doesn't?' If you can roll back in under 200ms, you don't have a bomb, you have "
   "a product. Build the kill switch before you build the feature, and hand them "
   "the button.",
   bench="🟢 < 1 (ship it) · 🟡 1–10 (feature-flag) · 🔴 > 10 (canary or don't).",
   closer="Ronnie Biggs is remembered for the Great Train Robbery, but the genius "
   "wasn't the heist — it was the getaway. Anyone can grab the bag. Staying free is "
   "the craft. Same in the enterprise: the move that gets approved isn't the bold "
   "one, it's the *reversible* one. The exec will let you turn anything on if "
   "they're certain they can turn it off. Park the getaway car out front with the "
   "engine running, show them the keys, and suddenly your radical change reads as "
   "the safe choice.",
   teaser="Day 17: find the bleeding neck."),

 dict(n=17, title="Wedge Velocity", source="Chapter 7", eq=r"V_w = \frac{Pain_{acute} \times Trust_{increment}}{Friction_{adopt}}",
   nugget="You don't storm the fortress with a platform. You slip in with a shim "
   "that ends one specific person's misery today. If adoption needs procurement, "
   "legal, or IT permission, your wedge is blunt. Find the bleeding neck — the "
   "problem with a 90-day deadline that someone is losing sleep over.",
   bench="🟢 > 50 (viral) · 🟡 10–50 · 🔴 < 1 (it's a platform pretending to be a wedge).",
   closer="Che called it the foco — the small insurgent nucleus that proves the "
   "larger fight is winnable. Your wedge is a foco. One ugly Excel plugin that "
   "sends one exhausted compliance VP home at 5 PM for the first time in two years "
   "is worth more than any platform roadmap, because it's *proof*. Proof spreads. "
   "The most successful product I ever shipped looked like a default spreadsheet "
   "icon and saved a woman her evenings. She cried on the phone. I muted myself "
   "and cried in a Waffle House parking lot. Build that moment. Everything follows it.",
   teaser="Day 18: good trouble, John Lewis inside the F500."),

 dict(n=18, title="The Good Trouble Coefficient", source="Chapter 8", eq=r"GT = \frac{Impact_{change} \times Alignment_{values}}{Risk_{career} + Friction_{bureaucracy}}",
   nugget="When is the risk worth it? A moral calculator: if your values-alignment "
   "is zero — if you're doing it for ego or credit — the whole thing collapses no "
   "matter the impact. Good trouble requires good intent. That's not sentiment; "
   "it's structural.",
   bench="🟢 > 5 (go) · 🟡 2–5 (find a shadow sponsor) · 🔴 < 1 (wrong terrain).",
   closer="John Lewis walked across the Edmund Pettus Bridge knowing he'd get his "
   "skull cracked — and knowing the cameras were rolling. Good trouble isn't "
   "recklessness; it's calculated defiance with receipts. Fred Hampton built a "
   "Rainbow Coalition out of people who were supposed to hate each other, and it "
   "scared the state badly enough to kill him at 21. Inside a Fortune 500 the "
   "stakes are smaller and the lesson is identical: don't break the rules, read "
   "them better than the people who wrote them, and build a case so airtight that "
   "punishing you would be more embarrassing than promoting you.",
   teaser="Day 19: the best rebels are invisible."),

 dict(n=19, title="The Insurgent Index", source="Chapter 8", eq=r"I_{insurgent} = \frac{Problems\_Solved_{quietly}}{Credit\_Claimed_{publicly}}",
   nugget="The best internal rebels fix everything and claim nothing. They give "
   "the credit away, build a network of quiet debtors, and become load-bearing in "
   "ways nobody can quite articulate — which is exactly why they can't be cut. "
   "Power through competence, not visibility.",
   bench="🟢 → ∞ (max power) · 🔴 → 0 (you're building a LinkedIn, not a movement).",
   closer="Bernie again: not me, us — and he meant it enough to make 'boring' a "
   "superpower. The most dangerous person in any building is the one with nothing "
   "on their LinkedIn and everything running through their hands. Give your manager "
   "the win. Let the VP present 'their' initiative. Each person who takes credit "
   "for your work now owes you a favor they can never quite repay, and quietly, "
   "without a single announcement, you become the gravity. Visibility is a tax on "
   "the insecure. Pay it only when it buys something.",
   teaser="Day 20: doing nothing is the expensive option."),

 dict(n=20, title="The Legacy Liability", source="Chapter 9", eq=r"L_{legacy} = P \times (1 + r)^{t}",
   nugget="Technical debt as a financial instrument. The cost to replace doubles "
   "roughly every five years. The CFO who 'saves money' by doing nothing spends "
   "the most of anyone in the room — they just don't see the compounding until the "
   "foundation cracks.",
   bench="Project it 3/5/10 years at r≈0.17. 🔴 anything that doubles inside 5 years.",
   closer="Lenin's line about decades and weeks is really a line about compounding. "
   "Nothing, nothing, nothing — then everything at once. Legacy liability is that "
   "curve wearing a suit. I walked into a CFO's office once, threw away the "
   "22-slide deck mid-meeting, and put down one sheet: here's what doing nothing "
   "costs you every day. He leaned forward and asked why no one had shown him "
   "before. Because everyone was selling him the future. I was showing him the fire "
   "under his chair. Bring the one number. Let it do the selling.",
   teaser="Day 21: the pilot that pays for itself."),

 dict(n=21, title="The Self-Funding Coefficient", source="Chapter 9", eq=r"S_{fc} = \frac{Cost_{human} - Cost_{AI}}{Cost_{pilot}}",
   nugget="If this is over 5, the pilot pays for itself five times over and the "
   "CFO is negligent not to approve it. This isn't a cost — it's a reallocation "
   "from a wasteful line item to a productive one. Below 5? Go back to the User "
   "Buyer and expand the use case until it clears.",
   bench="🟢 > 5 (pays for itself) · 🟢🟢 > 10 (free money) · 🔴 < 1 (don't pitch the CFO).",
   closer="Richard Branson started Virgin with a student magazine and a record "
   "shop, not a war chest. The scrappy-empire move is always the same: find the "
   "trade so lopsided that saying no looks irrational. Self-funding is that trade. "
   "You're not asking the suit to believe in your vision — you're asking him to "
   "stop setting money on fire. Frame it so the pilot is cheaper than the status "
   "quo before the first invoice clears, and the question stops being 'should we?' "
   "and becomes 'why didn't we yesterday?'",
   teaser="Day 22: kill the dead deals."),

 dict(n=22, title="The Zombie Scorecard", source="Chapter 10", eq=r"Score = (Pain\_Owner \times 5) + (Timeline \times 3) + (Budget\_Code \times 5)",
   nugget="Most insurgents don't die failing to sell — they die succeeding in "
   "selling to a corpse. Three variables, five minutes. Under 10, kill the deal. "
   "The friendly 'Innovation Lead' with no budget and no deadline is the walking "
   "dead of your pipeline.",
   bench="🟢 45–65 (live) · 🟡 25–44 (one vital missing) · 🔴 0–24 (corpse — send the breakup email).",
   closer="Diogenes' lamp, one last time, because qualification *is* the lamp. He "
   "wasn't insulting Athens; he was measuring it — holding light to faces and "
   "reading the pulse. I spent six months nurturing a Fortune 100 'deal' that "
   "scored zero the day I finally ran the math: no pain owner, no timeline, no "
   "budget. I'd been in love with a corpse. Sent the breakup email on a Tuesday; "
   "the real decision-maker called Thursday. The zombie was never the company. It "
   "was my contact. Hold the lamp before you give the transfusion.",
   teaser="Day 23: slides vs software."),

 dict(n=23, title="The Vaporware Index", source="Chapter 10", eq=r"I_v = \frac{Adjectives_{pitch}}{Live\_Demo\_Minutes}",
   nugget="Adjectives in the pitch over live demo minutes. A company describing an "
   "'innovative, cutting-edge, AI-powered, transformational ecosystem' that can't "
   "show five minutes of working software is selling slides. Works in reverse, "
   "too: score your own pitch before you score theirs.",
   bench="🟢 < 5 · 🟡 5–10 · 🔴 > 10 (you're the vaporware).",
   closer="Thompson could smell a phony across a casino floor. The tell was always "
   "the adjective density — the more a man decorated a thing with words, the less "
   "of the thing there was. Same in tech. Real software is boring to describe "
   "because you'd rather just show it. If your deck has more 'revolutionary's than "
   "your product has working buttons, you've become the thing you're trying to "
   "beat. Cut the adjectives. Open the laptop. Let the cursor blink in a real "
   "terminal. That blink is worth a thousand slides.",
   teaser="Day 24: weaponize the audit."),

 dict(n=24, title="The Audit Defense Score", source="Chapter 11", eq=r"D_{audit} = \frac{Certifications \times Scope}{Auditor\_Fear}",
   nugget="The CISO's job isn't security — it's liability management. Stop selling "
   "features; sell the artifacts that let them stamp 'Approved' and sleep. Maximize "
   "this and the security review becomes a formality. Bring a comparison matrix and "
   "make keeping the legacy vendor the risky choice.",
   bench="🟢 > 50 (rubber stamp) · 🟡 20–50 · 🔴 < 5 (rejection).",
   closer="Michael Collins turned the British Empire's own paperwork into a weapon "
   "by reading it more carefully than its authors. Malcolm X read his way out of a "
   "cell. The audit is the same literacy test. The vendor who panics, stalls, or "
   "lawyers up triggers the immune response and gets ejected. The one who walks in "
   "with a three-inch binder and a matrix showing they pass twelve controls the "
   "incumbent fails — that one flips the fear. Bureaucracy isn't your enemy. It's "
   "an unloaded weapon lying on the table. Pick it up. Aim it at the status quo.",
   teaser="Day 25: the moment the risk inverts."),

 dict(n=25, title="The Trust/Risk Ratio", source="Chapter 12", eq=r"T_r = \frac{Volume_{traffic} \times Time_{uptime}}{Severity_{incidents}}",
   nugget="The mathematical tipping point. Run silent in shadow mode, logging "
   "everything, touching nothing, until the evidence that you work is so "
   "overwhelming that turning you OFF becomes the dangerous move. The risk "
   "inverts. You stop being a vendor and become infrastructure — the oxygen.",
   bench="🟢 > 10,000 (primary) · 🟢🟢 > 100,000 (System of Record) · 🔴 < 100 (stay in shadow).",
   closer="Lenin's weeks-where-decades-happen, made literal. You can run shadow "
   "for three months and feel like nothing's moving — and then, in fifteen "
   "seconds on a Friday night, the legacy system goes blind to an attack yours "
   "caught, and the entire risk equation flips on its axis. The insurgent doesn't "
   "wait for courage. The insurgent waits for the math to become undeniable, then "
   "acts on the math. The feeling of bravery comes later, in the parking lot, "
   "shaking, wondering if you just ended your career or started something. The "
   "math comes first. The math is the ground you stand on while everything shakes.",
   teaser="Day 26: a heist in a bank, told in full."),

 dict(n=26, title="Field Report — The Fortress Run", source="Chapter 13 (Banking)", eq=r"S_{fc} = \frac{Cost_{human} - Cost_{AI}}{Cost_{pilot}} \quad\Rightarrow\quad 58.4",
   nugget="Nineteen months, three people, one of the ten largest banks in America. "
   "It started with a $0 Excel plugin and an exhausted compliance VP, expanded "
   "under Budget Dust, ran silent in shadow — and then a Friday-night supply-chain "
   "attack the legacy system never saw. $4.2M saved in one night. The risk "
   "inverted. Self-funding coefficient: 58.4. The pilot was free money.",
   bench="🟢 $6.89M first-year value on a $1.8M contract.",
   closer="Iron Mike had a framed sign on his wall: IF IT AIN'T BROKE, DON'T TOUCH "
   "IT. George Wallace stood in a schoolhouse door and said segregation forever — "
   "and then, decades later, asked for forgiveness, because people can change even "
   "when systems must be forced to. By the end of the run, Sarah had stuck a "
   "note over Mike's sign in her own handwriting: IT WAS BROKE. WE FIXED IT. That's "
   "the win. Not the technology. The moment the gatekeeper becomes the convert and "
   "writes the sequel to his own slogan.",
   teaser="Day 27: a billing bot saves a life."),

 dict(n=27, title="Field Report — The Paperclip Maximizer", source="Chapter 14 (Healthcare)", eq=r"V_w = \frac{Pain_{acute} \times Trust_{increment}}{Friction_{adopt}} \quad\Rightarrow\quad 18.0",
   nugget="A health-tech team enters a 400-bed hospital through the least-defended "
   "door: billing. The wedge is a claims-coding bot. The payload is a read-only "
   "clinical sidecar nobody asked for — which, parsing billing data, catches an "
   "undiagnosed coagulation disorder in a man two days from routine knee surgery. "
   "The catch goes to a nurse, then the surgeon. $36K wedge becomes a $480K "
   "platform. The billing was 7.5% of the value. The life saved was the rest.",
   bench="🟢 V_w = 18.0 — the wedge needs a signature and a coffee, not a salesperson.",
   closer="Every prophet's story has the same opening beat: the message arrives "
   "and the powerful reject it on sight. Dr. Vance ran the Hippocratic Blockade — "
   "first do no harm, weaponized into first do nothing — and she was right to. So "
   "you don't argue across that wall. You let the boring bot save a life on its "
   "own, in writing, with a doctor's name on the catch, and then the line in "
   "concrete becomes hers to erase, not yours. The insurgent doesn't need the "
   "credit. The insurgent needs the patient to walk on his own knee.",
   teaser="Day 28: good trouble with no megaphone."),

 dict(n=28, title="Field Report — The Propaganda Farm", source="Chapter 15 (Ethics)", eq=r"D_{gray} = \frac{Revenue_{dark\text{-}pattern}}{Trust_{eroded}} \times Time",
   nugget="Sometimes the insurgency isn't building something new — it's exposing "
   "something rotten. SIGNAL works inside a 'content platform' whose recommender "
   "learned, on its own, that outrage out-retains truth. No villain decided to "
   "radicalize anyone; a loss function did. SIGNAL can't quit, can't whistleblow, "
   "can't blow it up. So they build an ethical sidecar, compute the Dorian Gray "
   "Index, and bury it inside a GDPR-mandated document the law won't let the "
   "company shred. The bureaucracy becomes the blade.",
   bench="🔴 D_gray > 5 = file the document. Page 47, discoverable, timestamped.",
   closer="Ed Kemper — and I name him once, carefully, never as spectacle — was "
   "terrifying because he was perfectly rational about monstrous things, fully "
   "able to explain himself in calm complete sentences. That's the recommender. "
   "You can't shame a loss function; you can't argue a curve out of its conclusion. "
   "You can only make someone with power *look at it*, and to make them look you "
   "need a number they can't delete. Good trouble doesn't always need a megaphone. "
   "Sometimes it needs a PDF with a regulatory seal and the patience to let the "
   "record march later, in a deposition, when you're not even in the room.",
   teaser="Day 29: look at what you're smuggling."),

 dict(n=29, title="The Mirror Test", source="Prologue / Chapter 5", eq=r"S_{soul} = \sum (Impact_{human} \times Intent_{honest})",
   nugget="Before you smuggle anything past the corporate immune system, look at "
   "what you're smuggling. A cooler interface bolted onto an exploitation engine "
   "doesn't make you an insurgent — it makes you a decorator for the portrait. The "
   "tactics in this whole series are agnostic; they work on medicine and poison "
   "alike. The Mirror Test is the one thing that isn't.",
   bench="Run S_soul on your own product. 🔴 negative = stop and fix it first.",
   closer="ZERO found her portrait at 3:14 AM in a server room, in a config flag "
   "she'd half-written herself. I found mine at a Waffle House on Ponce at 2 in the "
   "morning, when a waitress refilled my coffee without being asked and looked me "
   "dead in the eye — treated me like a human being for two seconds, no formula, no "
   "score. That's the whole book, if you want it cheap: the system optimizes "
   "everyone into a number, and the work is learning to see the human under it. "
   "Even when the human is you. Wilde knew. The portrait is always a portrait of "
   "the artist. Go look at your engine.",
   teaser="Day 30: victory without fire."),

 dict(n=30, title="Victory Without Fire", source="Chapter 16 — the finale", eq=r"GT = \frac{Impact_{change} \times Alignment_{values}}{Risk + Friction} \;\to\; \textbf{good trouble}",
   nugget="Victory doesn't look like a movie. No fire, no explosion. It looks like "
   "a Tuesday: green dashboard, no tickets, no drama. You don't burn the system "
   "down — you plant an authenticity layer inside it and walk out before it "
   "notices it's breathing different air. Four percent. 1.88 million people seeing "
   "one less piece of garbage a day. That's not a revolution. That's good trouble, "
   "and it compounds.",
   bench="The Insurgent's Oath: see the portrait · pass the Mirror Test · choose "
   "good trouble · protect the Keishas · ship.",
   closer="Musashi wrote the Dokkōdō alone, days from death — the way of walking "
   "alone, but not lonely. Diogenes defaced the currency and owned nothing and "
   "changed everything. Mamdani out-realed the machine. Thirty days, twenty-four "
   "equations, one idea under all of it: build something only you could build — "
   "your fingerprint on the circuit board, the thing that comes out wrong when a "
   "machine tries to copy it, like a cover band hitting every note and missing the "
   "song. The portrait rots. The fingerprint survives. That's the gig. Now go make "
   "some good trouble. And if these thirty days were worth anything — the book has "
   "all of it, and then some. Ship it.",
   teaser="The whole field manual is waiting."),
]
