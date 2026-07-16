import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "FAQ — Spaceship Alpha 9",
  description:
    "Everything you actually want to know about Spaceship Alpha 9. What is it, how does it work, what's the deal with Space Pirate Zero, and why does any of this exist.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ — Spaceship Alpha 9",
    description:
      "6 products. Zero VC. One home office. Your questions answered without the corporate PR spin.",
    images: [{ url: "/api/og?title=FAQ&subtitle=Your+Questions+Answered+Without+the+PR+Spin&type=faq", width: 1200, height: 630 }],
  },
};

const faqs = [
  {
    q: "What IS Spaceship Alpha 9?",
    a: "An AI-native indie software studio operating out of a single home office in Atlanta, Georgia. We build consumer apps, developer tools, AI platforms, games, and infrastructure — 6 products at last count. No investors. No board. No permission required. Just two people with taste, tools, and a refusal to wait for someone to fund their vision.",
    category: "THE BASICS",
  },
  {
    q: "Who built all of this?",
    a: "Greg Chambers (Space Pirate Zero) — former Coca-Cola Global Group Director of Digital Innovation, Guinness World Record holder, multi-patent inventor — and Daniela Chambers, Emmy-nominated CNN producer turned CEO of StyleLift. We did this in the time it takes most startups to draft their Series A deck.",
    category: "THE BASICS",
  },
  {
    q: "6 products? That's not a studio, that's a hallucination.",
    a: "That's what the VC-backed teams say too, right before they see the shipping velocity. AI doesn't just write code — it's the first mate, the QA engineer, the content writer, and the design reviewer. When your tools are this good, headcount becomes a liability, not an asset. The future belongs to small teams who refuse to ask permission.",
    category: "THE BASICS",
  },
  {
    q: "How do you fund this without VC?",
    a: "Revenue. Wild concept, we know. Products generate income. Income funds more products. It compounds. No runway anxiety, no board meetings, no \"pivot to enterprise\" mandates from someone who's never shipped software. The model is simple: build things people actually want, price them honestly, repeat.",
    category: "MONEY",
  },
  {
    q: "Are you actually profitable?",
    a: "We don't disclose financials. What we will say: we're still here, we're still building, and nobody's told us to stop. Draw your own conclusions.",
    category: "MONEY",
  },
  {
    q: "Why no investors? Wouldn't funding accelerate things?",
    a: "Funding accelerates headcount. Headcount accelerates meetings. Meetings decelerate shipping. We'd rather move at the speed of taste than at the speed of consensus. Every company that raised $50M to build what we built with zero is a case study in what happens when you confuse capital with capability.",
    category: "MONEY",
  },
  {
    q: "What's Space Pirate Zero?",
    a: "The alter ego. Greg Chambers writes investigative AI dispatches on Substack as Space Pirate Zero — dissecting enterprise AI failures, dark web ecosystems, cybersecurity theater, and what real digital transformation looks like versus what it gets sold as. The music is also his. Six albums of cosmic lo-fi hip-hop that sounds like what would happen if Bossa Nova and a satellite collision had a baby.",
    category: "THE PEOPLE",
  },
  {
    q: "What's StyleLift and what does Daniela do?",
    a: "StyleLift is the first wardrobe-aware AI shopping platform — not a recommendation engine, a real intelligence layer that understands what you own, what fits your body, what fits your budget, and what fits you. Daniela Chambers is the CEO. She spent years at CNN understanding what makes people stop scrolling and actually care. She brought that instinct to fashion. The result is a product that feels like a personal stylist, not a glorified filter.",
    category: "THE PEOPLE",
  },
  {
    q: "Can I invest in or acquire Spaceship Alpha 9?",
    a: "No. We're not looking for investors, acquirers, advisors, strategic partners, or synergy opportunities. If you'd like to use our products, we'd love that. If you'd like to buy an album on streaming, even better.",
    category: "MONEY",
  },
  {
    q: "What's Osmix?",
    a: "The Atomic music work grew up. Osmix is one Rust engine that turns an AI-generated MP3 (Suno and friends) into a real multi-DAW session — separated stems, drum classification, tempo map, MIDI, and a master tuned to your destination's loudness target. Suno gives you stems. Osmix gives you a session.",
    category: "THE PRODUCTS",
  },
  {
    q: "What design systems do you use?",
    a: "Five. NEON (neon pink on black, cel-shaded, chunky borders — what you're looking at right now). PHOSPHOR (terminal green, DARKWAVE). LEOPARD (pink leopard print, StyleLift). STEALTH (matte black, B2B tools). CATHODE (retro CRT). Each product gets its own visual identity because one-size-fits-all design is how you get software that looks like everything else.",
    category: "THE PRODUCTS",
  },
  {
    q: "What is IRONCLAD?",
    a: "Our internal quality gate. Nothing ships without passing type checks, lint, accessibility audits, GHOST AI usability tests, and design token compliance. No TODO comments. No console.logs. No placeholder text. Every commit is releasable or it doesn't merge. It's not a process — it's a standard.",
    category: "THE PRODUCTS",
  },
  {
    q: "What's the deal with the Substack?",
    a: "Space Pirate Zero (Greg) publishes investigative AI writing on Substack — real journalism, not content marketing. Dark web investigations. Enterprise AI exposés. Cybersecurity analysis that doesn't pull punches. No algorithms curating your feed. No platform burying your posts. Subscribe if you want signal, not noise.",
    category: "CONTENT",
  },
  {
    q: "How do I follow along?",
    a: "Subscribe to the Substack at spacepiratezero.substack.com. Follow on LinkedIn, Bluesky, or X (@SpacePirateZero). The dispatches come when they're ready — not on an editorial calendar, not because the algorithm demands content. When there's something worth saying, it gets said.",
    category: "CONTENT",
  },
  {
    q: "This website is intense. Are you okay?",
    a: "Never better. The cel-shading is intentional. The chunky borders are load-bearing. The neon pink is a design decision, not a cry for help. Software has looked like PowerPoint for too long. The Tiffany lamp, not the fluorescent tube.",
    category: "THE BASICS",
  },
];

const categories = [...new Set(faqs.map((f) => f.category))];

export default function FAQPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "FAQ", url: "https://spaceshipalpha9.co/faq" },
  ]);
  const faqSchema = faqPageJsonLd(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <Badge variant="cyan" className="mb-4">
            FREQUENTLY ASKED
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-4 leading-[0.9]">
            Questions.
            <br />
            <span className="text-sa9-pink">Actual Answers.</span>
          </h1>
          <p className="text-sa9-text-muted text-lg max-w-2xl">
            Everything you&apos;ve been wondering about Spaceship Alpha 9,
            Space Pirate Zero, and why any of this exists. No corporate PR.
            No hedging. Just the actual situation.
          </p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      {categories.map((category) => (
        <AnimatedSection key={category} className="py-16 sm:py-20 border-b-3 border-sa9-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-1 h-12 bg-sa9-pink flex-shrink-0 mt-1" />
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                {category}
              </h2>
            </div>
            <div className="space-y-4 max-w-4xl">
              {faqs
                .filter((f) => f.category === category)
                .map((faq, idx) => (
                  <details
                    key={idx}
                    className="group border-3 border-sa9-border bg-sa9-surface-raised shadow-[4px_4px_0_rgba(0,0,0,0.5)] open:border-sa9-pink open:shadow-[4px_4px_0_#990044]"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none font-display font-bold text-base uppercase tracking-wider text-sa9-text group-open:text-sa9-pink transition-colors">
                      <span>{faq.q}</span>
                      <span className="ml-4 flex-shrink-0 font-mono text-sa9-text-dim group-open:text-sa9-pink text-xl transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-6">
                      <div className="border-t-3 border-sa9-border pt-4">
                        <p className="text-sa9-text-muted leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* ══ CTA ══ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            Still have <span className="text-sa9-pink">questions</span>?
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8 max-w-xl mx-auto">
            The dispatches go deeper. The products speak for themselves.
            The music hits differently at 2am.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button variant="primary" size="lg">
                EXPLORE THE FLEET
              </Button>
            </Link>
            <a
              href="https://spacepiratezero.substack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                SUBSCRIBE ON SUBSTACK
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="ghost" size="lg">
                CONTACT
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
