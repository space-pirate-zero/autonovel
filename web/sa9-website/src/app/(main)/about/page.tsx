import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { breadcrumbJsonLd, personJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title:
    "Dossier — Greg Chambers (Space Pirate Zero) & Daniela Chambers | Spaceship Alpha 9",
  description:
    "The illustrated dossier of Spaceship Alpha 9's founders. Greg Chambers (Space Pirate Zero): former Coca-Cola Global Group Director of Digital Innovation, 3x U.S. patent inventor, Guinness World Record holder, OSINT/red-team operator. Daniela Chambers: Emmy-nominated CNN producer turned StyleLift CEO. Six AI-native products, zero venture capital, one home office in Atlanta.",
  keywords: [
    "Greg Chambers",
    "Space Pirate Zero",
    "Daniela Chambers",
    "Spaceship Alpha 9 founders",
    "Greg Chambers Coca-Cola",
    "Greg Chambers patents",
    "Guinness World Record 3D billboard",
    "StyleLift CEO",
    "Emmy-nominated producer",
    "enterprise AI strategist Atlanta",
    "AI-native indie studio",
    "OSINT red team",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Dossier — The Crew Behind Spaceship Alpha 9",
    description:
      "A Coca-Cola innovation director turned Space Pirate Zero, and an Emmy-nominated CNN producer turned fashion-tech CEO. Six products. No VC. Told in comic panels.",
    images: [{ url: "/images/about/comic/hero-atlanta.webp", width: 860, height: 860 }],
  },
};

const achievements = [
  { value: "6", label: "Products Shipping" },
  { value: "3", label: "U.S. Patents" },
  { value: "$600M+", label: "Revenue Driven" },
  { value: "15K+", label: "Stores Deployed" },
  { value: "0", label: "VC Dollars" },
  { value: "1", label: "Home Office" },
];

type Chapter = {
  img: string;
  alt: string;
  no: string;
  chapter: string;
  heading: string;
  body: string;
  accent: "pink" | "cyan";
};

const gregChapters: Chapter[] = [
  {
    img: "greg-1-coke",
    alt: "A Coca-Cola vending machine projecting a conversational-AI hologram — Greg Chambers' work at Coca-Cola",
    no: "01",
    chapter: "The Corporate Insurgent",
    heading: "Taught a giant to think",
    body: "As Global Group Director of Digital Innovation at The Coca-Cola Company, Greg Chambers deployed conversational AI into physical vending infrastructure across 15,000+ retail locations worldwide — turning transactions into relationships and one of the world's largest companies into a software company.",
    accent: "pink",
  },
  {
    img: "greg-2-record",
    alt: "The world's first 3D robotic LED-cube billboard in Times Square — a Guinness World Record",
    no: "02",
    chapter: "The World Record",
    heading: "1,760 LED cubes in Times Square",
    body: "He built the world's first 3D robotic billboard — 1,760 independently moving LED cubes suspended over Times Square — and set a Guinness World Record. Forbes, Fortune, and the BBC covered it.",
    accent: "cyan",
  },
  {
    img: "greg-3-patents",
    alt: "Holographic patent blueprints and an AI intelligence engine — three U.S. patents",
    no: "03",
    chapter: "The Inventor",
    heading: "Three U.S. patents",
    body: "Co-inventor of three granted U.S. patents in AI, IoT, and security — including a personalized-treatment intelligence engine for Therabody. He went on to architect Apple Silicon AI clusters powering Apple Intelligence, Epic Games, and OpenAI.",
    accent: "pink",
  },
  {
    img: "greg-4-shadow",
    alt: "A dark ops room with radar, terminals and dark-web data streams — OSINT and red-team work",
    no: "04",
    chapter: "The Shadow Operator",
    heading: "OSINT. SIGINT. Red team.",
    body: "A parallel life in threat intelligence: dark-web reconnaissance, legendary OSINT and SIGINT tradecraft, and authorized red-team operations alongside major cybersecurity research collectives. You can't defend a system you've never tried to break.",
    accent: "cyan",
  },
  {
    img: "greg-5-spz",
    alt: "The Spaceship Alpha 9 bridge with a pirate flag — Space Pirate Zero, founder of Spaceship Alpha 9",
    no: "05",
    chapter: "The Captain",
    heading: "Became Space Pirate Zero",
    body: "Now founder and CTO of Spaceship Alpha 9 — shipping six AI-native products with zero venture capital — while writing investigative AI journalism and producing cosmic lo-fi music under the alias Space Pirate Zero.",
    accent: "pink",
  },
];

const daniChapters: Chapter[] = [
  {
    img: "dani-1-cnn",
    alt: "Daniela Chambers as an Emmy-nominated CNN producer holding an Emmy in a newsroom",
    no: "01",
    chapter: "The Storyteller",
    heading: "Emmy-nominated producer",
    body: "Daniela Chambers spent years inside the machine at CNN — producing stories that reached millions and learning exactly what makes people stop scrolling and actually care.",
    accent: "cyan",
  },
  {
    img: "dani-2-pivot",
    alt: "Daniela Chambers leaving broadcast news for the neon world of fashion-tech",
    no: "02",
    chapter: "The Pivot",
    heading: "Broadcast to fashion-tech",
    body: "She brought that newsroom instinct — the difference between information and emotion — to fashion, and never looked back. Fashion, she realized, is a data problem wearing a beautiful disguise.",
    accent: "pink",
  },
  {
    img: "dani-3-stylelift",
    alt: "Daniela Chambers conducting a holographic AI wardrobe and Style DNA helix for StyleLift",
    no: "03",
    chapter: "The Founder",
    heading: "Founded StyleLift",
    body: "As co-founder of StyleLift, she is building the first wardrobe-aware AI shopping platform — a 512-dimensional 'style DNA' that understands what you own, what fits your body, your budget, and you. Not another recommendation engine.",
    accent: "cyan",
  },
  {
    img: "dani-4-ceo",
    alt: "Daniela Chambers as CEO of StyleLift in a magenta power blazer",
    no: "04",
    chapter: "The CEO",
    heading: "Every woman deserves a stylist",
    body: "As CEO of StyleLift, Daniela leads a product built for how humans actually get dressed. AI just made it possible to give every woman a personal stylist.",
    accent: "pink",
  },
];

function ComicChapter({ c, flip }: { c: Chapter; flip: boolean }) {
  const isPink = c.accent === "pink";
  return (
    <AnimatedSection>
      <article
        className={`grid md:grid-cols-2 gap-6 sm:gap-10 items-center ${
          flip ? "md:[direction:rtl]" : ""
        }`}
      >
        {/* Panel */}
        <div className="[direction:ltr]">
          <div
            className={`group relative aspect-square w-full overflow-hidden border-3 ${
              isPink ? "border-sa9-pink" : "border-sa9-cyan"
            } bg-sa9-surface shadow-[6px_6px_0_rgba(0,0,0,0.6)]`}
          >
            <Image
              src={`/images/about/comic/${c.img}.webp`}
              alt={c.alt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 92vw, 560px"
            />
            <span
              className="absolute top-3 left-3 font-display font-black text-4xl text-white/90 drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)]"
              aria-hidden="true"
            >
              {c.no}
            </span>
            <span
              className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ${
                isPink ? "bg-sa9-pink" : "bg-sa9-cyan"
              }`}
              aria-hidden="true"
            />
          </div>
        </div>
        {/* Copy */}
        <div className="[direction:ltr]">
          <div
            className={`font-mono text-xs uppercase tracking-[0.3em] mb-3 ${
              isPink ? "text-sa9-pink" : "text-sa9-cyan"
            }`}
          >
            {c.no} · {c.chapter}
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-sa9-text mb-4 leading-[0.95]">
            {c.heading}
          </h3>
          <p className="text-sa9-text-muted text-base sm:text-lg leading-relaxed">
            {c.body}
          </p>
        </div>
      </article>
    </AnimatedSection>
  );
}

export default function AboutPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Dossier", url: "https://spaceshipalpha9.co/about" },
  ]);

  const gregPerson = personJsonLd({
    name: "Greg Chambers",
    alternateName: "Space Pirate Zero",
    jobTitle: "Founder & CTO, Spaceship Alpha 9",
    description:
      "Enterprise AI strategist, multi-patent inventor, OSINT/SIGINT operator and red teamer, Guinness World Record holder, investigative writer, and music producer. Former Coca-Cola Global Group Director of Digital Innovation.",
    url: "https://www.spacepiratezero.com",
    image: "https://spaceshipalpha9.co/images/spz/greg-v2.webp",
    sameAs: [
      "https://linkedin.com/in/gregchambers/",
      "https://x.com/SpacePirateZero",
      "https://bsky.app/profile/spacepiratezero.bsky.social",
      "https://spacepiratezero.substack.com",
      "https://github.com/space-pirate-zero",
    ],
  });

  const danielaPerson = personJsonLd({
    name: "Daniela Chambers",
    jobTitle: "Co-Founder & CEO, StyleLift",
    description:
      "Emmy-nominated CNN producer turned fashion-tech CEO. Building StyleLift, the first wardrobe-aware AI shopping platform.",
    url: "https://danielachambers.com",
    image: "https://spaceshipalpha9.co/images/spz/daniela-v2.webp",
    sameAs: ["https://www.linkedin.com/in/daniela-chambers-a9a67189/", "https://danielachambers.com"],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gregPerson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(danielaPerson) }} />

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-sa9-pink/[0.05] via-transparent to-sa9-cyan/[0.05]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
          <div>
            <Badge variant="pink" className="mb-5 animate-fade-in-up stagger-1">
              CLASSIFIED DOSSIER
            </Badge>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-5 leading-[0.88] animate-fade-in-up stagger-2">
              Two rebels.
              <br />
              <span className="text-sa9-pink">One ship.</span>
            </h1>
            <p className="text-sa9-text-muted text-lg leading-relaxed max-w-xl mb-8 animate-fade-in-up stagger-3">
              A Coca-Cola innovation director who became{" "}
              <strong className="text-sa9-cyan">Space Pirate Zero</strong>, and an{" "}
              <strong className="text-sa9-text">Emmy-nominated CNN producer</strong>{" "}
              who became a fashion-tech CEO. Together, Greg &amp; Daniela Chambers
              build <strong className="text-sa9-text">six AI-native products</strong>{" "}
              from one home office in Atlanta — zero venture capital, zero
              permission. This is their dossier, in comic panels.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
              <a href="#the-captain">
                <Button variant="primary" size="lg">MEET THE CAPTAIN →</Button>
              </a>
              <a href="https://calendar.app.google/1J6UnuYJYhrd8Vc87" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" data-cta="about:book">BOOK A CALL</Button>
              </a>
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto border-3 border-sa9-pink overflow-hidden shadow-[10px_10px_0_rgba(0,0,0,0.6)] animate-fade-in-up stagger-3">
            <Image
              src="/images/about/comic/hero-atlanta.webp"
              alt="The Spaceship Alpha 9 flying over the Atlanta skyline with a pirate flag"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 92vw, 580px"
            />
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x-3 divide-y-3 sm:divide-y-0 divide-sa9-border">
          {achievements.map((item) => (
            <div key={item.label} className="group px-5 py-8 text-center transition-colors hover:bg-sa9-surface">
              <div className="font-display font-black text-3xl sm:text-4xl text-sa9-pink mb-1 transition-transform group-hover:-translate-y-0.5">
                {item.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-muted leading-tight">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ THE CAPTAIN — Greg / Space Pirate Zero ══ */}
      <section id="the-captain" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-14">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 border-3 border-sa9-pink overflow-hidden bg-sa9-surface shadow-[4px_4px_0_#990044] animate-float">
              <Image src="/images/spz/greg-v2.webp" alt="Greg Chambers — Space Pirate Zero" fill className="object-cover object-top" sizes="112px" />
            </div>
            <div>
              <Badge variant="pink" className="mb-3">THE CAPTAIN · SPACE PIRATE ZERO</Badge>
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-sa9-text leading-[0.9]">
                Greg Chambers
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest text-sa9-cyan mt-2">
                Founder &amp; CTO · Enterprise AI Strategist · Multi-Patent Inventor
              </p>
            </div>
          </div>

          <div className="space-y-14 sm:space-y-20">
            {gregChapters.map((c, i) => (
              <ComicChapter key={c.img} c={c} flip={i % 2 === 1} />
            ))}
          </div>

          <blockquote className="max-w-3xl mx-auto text-center mt-16 sm:mt-20">
            <p className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight text-sa9-text leading-tight">
              &ldquo;The Tiffany lamp, not the fluorescent tube. If your product
              doesn&apos;t make someone feel something, you built a spreadsheet
              with a <span className="text-sa9-pink">login page</span>.&rdquo;
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <a href="https://spacepiratezero.substack.com" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm">SUBSTACK</Button>
              </a>
              <a href="https://linkedin.com/in/gregchambers/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">LINKEDIN</Button>
              </a>
              <a href="https://x.com/SpacePirateZero" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">X / TWITTER</Button>
              </a>
              <Link href="/press"><Button variant="ghost" size="sm">PRESS &amp; PATENTS</Button></Link>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ══ THE FIRST OFFICER — Daniela ══ */}
      <section className="py-20 sm:py-28 border-y-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-14">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 border-3 border-sa9-cyan overflow-hidden shadow-[4px_4px_0_#006680] animate-float">
              <Image src="/images/spz/daniela-v2.webp" alt="Daniela Chambers — CEO of StyleLift" fill className="object-cover object-top" sizes="112px" />
            </div>
            <div>
              <Badge variant="cyan" className="mb-3">THE FIRST OFFICER · STYLELIFT</Badge>
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-sa9-text leading-[0.9]">
                Daniela Chambers
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest text-sa9-pink mt-2">
                Co-Founder &amp; CEO, StyleLift · Emmy-Nominated Producer
              </p>
            </div>
          </div>

          <div className="space-y-14 sm:space-y-20">
            {daniChapters.map((c, i) => (
              <ComicChapter key={c.img} c={c} flip={i % 2 === 1} />
            ))}
          </div>

          <blockquote className="max-w-3xl mx-auto text-center mt-16 sm:mt-20">
            <p className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight text-sa9-text leading-tight">
              &ldquo;Every woman deserves a personal stylist. AI just made it
              possible to <span className="text-sa9-cyan">give her one</span>.&rdquo;
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <a href="https://stylelift.fashion" target="_blank" rel="noopener noreferrer">
                <Button variant="cyan" size="sm">STYLELIFT →</Button>
              </a>
              <a href="https://www.linkedin.com/in/daniela-chambers-a9a67189/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">LINKEDIN</Button>
              </a>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ══ MISSION LOG ══ */}
      <AnimatedSection className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-10">
            <div className="w-1 h-12 bg-sa9-green flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                Mission Log
              </h2>
              <p className="text-sa9-text-muted text-sm mt-1">
                Key moments in the Spaceship Alpha 9 trajectory.
              </p>
            </div>
          </div>
          <div className="max-w-4xl space-y-4">
            {[
              { year: "2024", title: "Spaceship Alpha 9 Launches", detail: "The indie studio goes live — six AI-native products across consumer apps, developer tools, games, and infrastructure. All bootstrapped." },
              { year: "2020", title: "StyleLift Founded", detail: "Greg and Daniela Chambers co-found the first wardrobe-aware AI shopping platform. Five intelligence layers, zero guesswork." },
              { year: "2020", title: "Therabody Intelligence Engine", detail: "Engineered the AI personalization engine for Theragun. Two U.S. patents filed. Fast Company Most Innovative Company." },
              { year: "2017", title: "Times Square World Record", detail: "Deployed the world's first 3D robotic billboard — 1,760 independently moving LED cubes. A Guinness World Record." },
              { year: "2015", title: "Connected Retail at Scale", detail: "AI-driven personalization to 15,000+ stores globally. 8% sales lift, ~$600M/year incremental. Forbes, Fortune, BBC." },
            ].map((entry, idx) => (
              <div key={idx} className="group flex gap-6 border-3 border-sa9-border bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-sa9-green hover:shadow-[6px_6px_0_#1a5c00]">
                <div className="flex-shrink-0 font-display font-black text-2xl text-sa9-green w-16 text-right">{entry.year}</div>
                <div className="border-l-3 border-sa9-border pl-6">
                  <h3 className="font-display font-bold text-sa9-text uppercase tracking-wide mb-1">{entry.title}</h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ THE OPERATING SYSTEM ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-raised py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <div className="border-3 border-sa9-border bg-sa9-surface p-8 sm:p-12 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-cyan mb-6">
                The Operating System
              </h2>
              <div className="space-y-4 text-sa9-text leading-relaxed">
                <p>
                  Every SA9 product exists because we needed it first. Dogfooding
                  isn&apos;t a phase — it&apos;s the entire methodology. The best
                  software comes from builders who use their own tools every day
                  and get furious when something is slow, ugly, or dishonest.
                </p>
                <p>
                  We study Fitts&apos;s Law, cognitive load theory, and somatic
                  markers — then we make it look like a cyberpunk anime. The
                  Tiffany lamp, not the fluorescent tube. Friction creates
                  meaning. We build for resonance, not extraction.
                </p>
                <p>
                  No dark patterns. No engagement traps. No notification spam
                  engineered to exploit dopamine loops. We build tools, not traps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4">
            Enough <span className="text-sa9-pink">reading</span>. Go see what we{" "}
            <span className="text-sa9-cyan">built</span>.
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8 max-w-xl mx-auto">
            Six products. A full-cast audiobook streaming now. Three patents. All
            from one home office in Atlanta.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products"><Button variant="primary" size="lg">EXPLORE THE FLEET</Button></Link>
            <Link href="/studio"><Button variant="secondary" size="lg">THE STUDIO</Button></Link>
            <a href="https://calendar.app.google/1J6UnuYJYhrd8Vc87" target="_blank" rel="noopener noreferrer">
              <Button variant="cyan" size="lg" data-cta="about:cta-book">BOOK A CALL</Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
