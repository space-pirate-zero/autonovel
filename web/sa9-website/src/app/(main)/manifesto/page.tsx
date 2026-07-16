import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Manifesto — 8 Principles for Building Without Permission",
  keywords: ["SA9 manifesto","indie AI studio principles","ship or die","own your stack","bootstrap","building without permission","AI-native","Space Pirate Zero"],
  description:
    "The Spaceship Alpha 9 manifesto. Ship or Die. Own Your Stack. Bootstrap Everything. Eight principles for building AI-native software without venture capital or compromise.",
  alternates: {
    canonical: "/manifesto",
  },
  openGraph: {
    title: "The SA9 Manifesto — 8 Principles for Indie Builders",
    description:
      "Ship or Die. Own Your Stack. Don't Kill the Lamp. Eight principles for building software that matters.",
    images: [{ url: "/images/manifesto/hero.webp", width: 1024, height: 1024 }],
  },
};

const principles = [
  {
    number: "01",
    title: "Ship or Die",
    art: "01-ship-or-die",
    accent: "pink" as const,
    body: "Ideas are worthless. Execution is everything. A shipped product with rough edges beats a perfect prototype that never leaves localhost. We deploy on Fridays. We push to main. We fix forward. The graveyard is full of beautiful wireframes.",
  },
  {
    number: "02",
    title: "Own Your Stack",
    art: "02-own-your-stack",
    accent: "cyan" as const,
    body: "Every dependency is a liability. Every SaaS subscription is a lease on someone else's roadmap. We self-host what matters, open-source what we can, and build what nobody else will. The MBA Efficiency Paradox says optimizing metrics destroys the human resonance that created value. We optimize for resonance.",
  },
  {
    number: "03",
    title: "Small Teams > Big Committees",
    art: "03-small-teams",
    accent: "pink" as const,
    body: "A small team with taste, tools, and AI can outship an entire department. No sprint planning. No standups. No permission. Just focus, velocity, and relentless iteration. The Tiffany lamp, not the fluorescent tube.",
  },
  {
    number: "04",
    title: "Don't Kill the Lamp",
    art: "04-dont-kill-the-lamp",
    accent: "cyan" as const,
    body: "Preserve inefficient beauty. Friction creates meaning. Every pixel is intentional. Every animation serves a purpose. We study Fitts’s Law, cognitive load theory, and somatic markers — then we make it look like a cyberpunk anime. Design is not decoration. It’s the product.",
  },
  {
    number: "05",
    title: "Bootstrap Everything",
    art: "05-bootstrap-everything",
    accent: "pink" as const,
    body: "Zero venture capital. Zero runway anxiety. Zero board meetings. Revenue comes from shipping things people want to pay for, not from convincing rich strangers that hockey sticks are real. Independence is the product. Everything else is a feature.",
  },
  {
    number: "06",
    title: "AI Is a Crew Member",
    art: "06-ai-crew-member",
    accent: "cyan" as const,
    body: "AI isn’t a feature we bolt on — it’s how we build. Intelligence should be embedded in the product, not stapled to the side. AI writes code, tests usability, generates content, and catches bugs. Humans provide taste, direction, and the audacity to ship six products from one studio.",
  },
  {
    number: "07",
    title: "Quality Is Non-Negotiable",
    art: "07-quality-ironclad",
    accent: "pink" as const,
    body: "IRONCLAD isn’t optional. Every commit passes type checks, lint, tests, and accessibility audits. Every component uses design tokens. Every deploy gets AI usability testing. Shortcuts are for keyboards, not code. Enshittification starts when you stop caring.",
  },
  {
    number: "08",
    title: "Build in Public, Ship in Stealth",
    art: "08-build-public-ship-stealth",
    accent: "cyan" as const,
    body: "Share the journey, protect the details. Obfuscated check-ins, snarky progress bars, and vibes-only updates until launch day. Then — everything, all at once, no warning. No algorithms. No noise. Just signal.",
  },
];

export default function ManifestoPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Manifesto", url: "https://spaceshipalpha9.co/manifesto" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-sa9-pink/[0.04] via-transparent to-sa9-cyan/[0.05]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative grid lg:grid-cols-[1fr_0.85fr] gap-10 items-center">
          <div>
            <Badge variant="pink" className="mb-6">
              OPEN TRANSMISSION
            </Badge>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-6 leading-[0.9]">
              The SA9
              <br />
              <span className="text-sa9-pink animate-neon-pulse">
                Manifesto.
              </span>
            </h1>
            <p className="text-sa9-text-muted text-lg max-w-xl">
              Eight principles for building software without asking permission.
              <br />
              <span className="text-sa9-cyan font-mono text-sm">
                Dispatches from the outer edge.
              </span>
            </p>
          </div>
          <div className="relative aspect-square w-full max-w-md mx-auto lg:mx-0 lg:ml-auto animate-float">
            <Image
              src="/images/manifesto/hero-cut.webp"
              alt="Spaceship Alpha 9 broadcasting its manifesto"
              fill
              priority
              className="object-contain drop-shadow-[0_0_45px_rgba(0,229,255,0.35)]"
              sizes="(max-width: 1024px) 90vw, 40vw"
            />
          </div>
        </div>
      </section>

      {/* ══ PRINCIPLES ══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-14">
            {principles.map((principle, index) => {
              const flip = index % 2 === 1;
              const isPink = principle.accent === "pink";
              return (
                <AnimatedSection key={principle.number}>
                  <article
                    className={`grid md:grid-cols-2 gap-6 sm:gap-10 items-center ${
                      flip ? "md:[direction:rtl]" : ""
                    }`}
                  >
                    {/* Emblem */}
                    <div className="[direction:ltr]">
                      <div
                        className={`relative aspect-square w-full max-w-sm mx-auto border-3 ${
                          isPink ? "border-sa9-pink" : "border-sa9-cyan"
                        } bg-sa9-surface overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,0.6)]`}
                      >
                        <Image
                          src={`/images/manifesto/${principle.art}.webp`}
                          alt={`${principle.title} — SA9 emblem`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 90vw, 400px"
                        />
                        <span className="absolute top-3 left-3 font-display font-black text-3xl text-white/90 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                          {principle.number}
                        </span>
                      </div>
                    </div>
                    {/* Text */}
                    <div className="[direction:ltr]">
                      <div
                        className={`font-mono text-xs uppercase tracking-[0.3em] mb-3 ${
                          isPink ? "text-sa9-pink" : "text-sa9-cyan"
                        }`}
                      >
                        PRINCIPLE {principle.number}
                      </div>
                      <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-sa9-text mb-4 leading-[0.95]">
                        {principle.title}
                      </h2>
                      <p className="text-sa9-text-muted text-base sm:text-lg leading-relaxed">
                        {principle.body}
                      </p>
                    </div>
                  </article>
                </AnimatedSection>
              );
            })}
          </div>

          {/* ══ CLOSING ══ */}
          <div className="mt-20 sm:mt-28 text-center border-t-3 border-sa9-border pt-16">
            <blockquote className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-sa9-text mb-8 leading-tight">
              &ldquo;We didn&apos;t build a tool.
              <br />
              We built a{" "}
              <span className="text-sa9-pink animate-neon-pulse">
                consciousness
              </span>
              .&rdquo;
            </blockquote>
            <p className="text-sa9-text-dim font-mono text-sm mb-10">
              — Space Pirate Zero, digital insurgent at large
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
                <Button variant="cyan" size="lg">
                  READ DISPATCHES
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
