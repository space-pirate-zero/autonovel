import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import {
  breadcrumbJsonLd,
  videoObjectJsonLd,
  personJsonLd,
  faqPageJsonLd,
} from "@/lib/structured-data";
import { videos, pressItems, patents, book } from "@/lib/press";

export const metadata: Metadata = {
  title:
    "Press Room — Greg Chambers (Space Pirate Zero): Forbes, Fortune, BBC & 3 Patents",
  description:
    "Official press room for Greg Chambers, aka Space Pirate Zero — enterprise AI strategist, 3x U.S. patent inventor, Guinness World Record holder, and former Coca-Cola Global Group Director of Digital Innovation. Featured in Forbes, Fortune, BBC, VICE, VentureBeat, and Google. Keynote videos, press features, patents, bio, and press kit.",
  keywords: [
    "Greg Chambers",
    "Space Pirate Zero",
    "Greg Chambers press",
    "Greg Chambers Coca-Cola",
    "Greg Chambers patents",
    "Greg Chambers keynote speaker",
    "enterprise AI keynote speaker",
    "AI strategist Atlanta",
    "Guinness World Record billboard",
    "Digital Insurgency book",
    "Spaceship Alpha 9",
    "book Greg Chambers speaker",
  ],
  alternates: {
    canonical: "/press",
  },
  openGraph: {
    title: "Press Room — Greg Chambers / Space Pirate Zero",
    description:
      "Forbes, Fortune, BBC, VICE, VentureBeat, Google. 3 U.S. patents. 1 Guinness World Record. Keynotes, press features, bio, and press kit.",
    images: [{ url: "/api/og?title=Press+Room&subtitle=Forbes,+Fortune,+BBC,+VICE,+VentureBeat,+Google&type=press", width: 1200, height: 630 }],
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

function getPublication(url: string): string {
  if (url.includes("forbes.com")) return "Forbes";
  if (url.includes("fortune.com")) return "Fortune";
  if (url.includes("bbc.com")) return "BBC News";
  if (url.includes("vice.com")) return "VICE";
  if (url.includes("venturebeat.com")) return "VentureBeat";
  if (url.includes("blog.google")) return "Google";
  if (url.includes("marketingdive.com")) return "Marketing Dive";
  if (url.includes("digitalsignagetoday.com")) return "Digital Signage Today";
  if (url.includes("bia.com")) return "BIA/Kelsey";
  if (url.includes("nridigital.com")) return "NRI Digital";
  if (url.includes("youtube.com")) return "YouTube";
  if (url.includes("justia.com")) return "USPTO";
  return "Press";
}

const OUTLETS = [
  "Forbes",
  "Fortune",
  "BBC News",
  "VICE",
  "VentureBeat",
  "Google",
  "Marketing Dive",
];

const FAST_FACTS: { label: string; value: string }[] = [
  { label: "Full name", value: "Greg Chambers" },
  { label: "Alias", value: "Space Pirate Zero" },
  { label: "Current role", value: "Founder & CTO, Spaceship Alpha 9" },
  { label: "Former role", value: "Global Group Director of Digital Innovation, The Coca-Cola Company" },
  { label: "Patents", value: "3 granted U.S. patents (AI, IoT, security)" },
  { label: "World record", value: "Guinness World Record — first 3D robotic billboard, Times Square" },
  { label: "Based in", value: "Atlanta, Georgia" },
  { label: "Book", value: "Digital Insurgency (Amazon, 2026)" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Who is Greg Chambers (Space Pirate Zero)?",
    a: "Greg Chambers is an enterprise AI strategist, multi-patent inventor, and the founder and CTO of Spaceship Alpha 9, an AI-native indie software studio in Atlanta. Under the alias Space Pirate Zero he also writes investigative AI journalism and produces music. He formerly served as Global Group Director of Digital Innovation at The Coca-Cola Company.",
  },
  {
    q: "What is Greg Chambers best known for?",
    a: "He is best known for deploying conversational AI across 15,000+ Coca-Cola retail locations, building the world's first 3D robotic billboard in Times Square (a Guinness World Record with 1,760 independently moving LED cubes), holding three U.S. patents, and founding Spaceship Alpha 9 and StyleLift.",
  },
  {
    q: "Which companies has Greg Chambers worked with?",
    a: "The Coca-Cola Company, Apple (Apple Intelligence infrastructure), Epic Games, OpenAI, Therabody, Meijer, Eaton, Black & Veatch, and dosist, among others.",
  },
  {
    q: "Where has Greg Chambers been featured in the press?",
    a: "Forbes, Fortune, BBC News, VICE, VentureBeat, Google's official blog, Marketing Dive, Digital Signage Today, and BIA/Kelsey, covering his work in enterprise AI, retail innovation, and connected commerce.",
  },
  {
    q: "Does Greg Chambers speak at conferences?",
    a: "Yes. Greg Chambers is an available keynote speaker on enterprise AI strategy, governed AI, and AI-native product development. Booking and press inquiries can be sent through the Spaceship Alpha 9 contact page.",
  },
  {
    q: "What is Digital Insurgency?",
    a: "Digital Insurgency is Greg Chambers' book on smuggling radical innovation past corporate bureaucracy — the 'Trojan Horse Protocol' for shipping generative AI and agentic workflows inside Fortune 500 environments. It is available now in paperback and Kindle on Amazon.",
  },
];

export default function PressPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Press", url: "https://spaceshipalpha9.co/press" },
  ]);

  const person = personJsonLd({
    name: "Greg Chambers",
    alternateName: "Space Pirate Zero",
    jobTitle: "Founder & CTO, Spaceship Alpha 9",
    description:
      "Enterprise AI strategist, 3x U.S. patent inventor, Guinness World Record holder, and former Coca-Cola Global Group Director of Digital Innovation. Featured in Forbes, Fortune, BBC, VICE, VentureBeat, and Google.",
    url: "https://spaceshipalpha9.co/press",
    image: "https://spaceshipalpha9.co/images/captain-face.png",
    sameAs: [
      "https://linkedin.com/in/gregchambers/",
      "https://x.com/SpacePirateZero",
      "https://bsky.app/profile/spacepiratezero.bsky.social",
      "https://spacepiratezero.substack.com",
      "https://github.com/space-pirate-zero",
    ],
  });

  const faqSchema = faqPageJsonLd(FAQS);

  const videoSchemas = videos.map((video) =>
    videoObjectJsonLd({
      title: video.title,
      description: video.summary ?? "",
      youtubeId: video.youtubeId ?? "",
      date: video.date,
    })
  );

  const stats = [
    { value: String(pressItems.length), label: "Press Features" },
    { value: String(videos.length), label: "Keynote Videos" },
    { value: String(patents.length), label: "U.S. Patents" },
    { value: "1", label: "Guinness World Record" },
    { value: "15K+", label: "Stores Deployed" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {videoSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-sa9-pink/[0.04] via-transparent to-sa9-cyan/[0.04]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <Badge variant="orange" className="mb-5">
              PRESS ROOM · GREG CHAMBERS
            </Badge>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-5 leading-[0.88]">
              Greg Chambers
              <br />
              <span className="text-sa9-pink">in the headlines.</span>
            </h1>
            <p className="text-sa9-text-muted text-lg max-w-2xl leading-relaxed">
              Enterprise AI strategist. Multi-patent inventor. Guinness World
              Record holder. Former{" "}
              <strong className="text-sa9-text">Coca-Cola Global Group Director of Digital Innovation</strong>,
              now founder &amp; CTO of Spaceship Alpha 9 — writing as{" "}
              <strong className="text-sa9-cyan">Space Pirate Zero</strong>.
              Featured in Forbes, Fortune, BBC, VICE, VentureBeat, and Google.
            </p>
          </div>
          <div className="relative w-40 h-40 lg:w-56 lg:h-56 mx-auto border-3 border-sa9-pink overflow-hidden shadow-[8px_8px_0_#990044] animate-float">
            <Image
              src="/images/captain-face.png"
              alt="Greg Chambers — Space Pirate Zero — press headshot"
              fill
              priority
              className="object-cover object-top"
              sizes="224px"
            />
          </div>
        </div>
      </section>

      {/* ══ AUTHORITY STAT BAR ══ */}
      <section className="border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x-3 divide-y-3 sm:divide-y-0 divide-sa9-border">
          {stats.map((s) => (
            <div key={s.label} className="px-5 py-8 text-center">
              <div className="font-display font-black text-3xl sm:text-4xl text-sa9-pink mb-1">
                {s.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AS FEATURED IN ══ */}
      <section className="py-10 border-b-3 border-sa9-border" aria-label="Featured in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sa9-text-dim text-center mb-6">
            As featured in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {OUTLETS.map((o) => (
              <span
                key={o}
                className="font-display font-bold text-lg sm:text-xl uppercase tracking-wide text-sa9-text-muted hover:text-sa9-text transition-colors"
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRESS KIT / FAST FACTS ══ */}
      <AnimatedSection className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16">
          <div>
            <Badge variant="cyan" className="mb-4">
              PRESS KIT · BIO
            </Badge>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-6">
              The <span className="text-sa9-cyan">short version</span>
            </h2>
            <div className="space-y-4 text-sa9-text-muted leading-relaxed">
              <p>
                <strong className="text-sa9-text">Greg Chambers</strong> is an
                enterprise AI strategist and multi-patent inventor who spent a
                decade teaching one of the world&apos;s largest companies how to
                think in software. As Global Group Director of Digital Innovation
                at The Coca-Cola Company, he deployed conversational AI across
                more than 15,000 retail locations and built the world&apos;s
                first 3D robotic billboard in Times Square — a Guinness World
                Record.
              </p>
              <p>
                Today he is founder and CTO of{" "}
                <Link href="/about" className="text-sa9-cyan hover:underline">
                  Spaceship Alpha 9
                </Link>
                , an AI-native indie studio shipping six products with zero
                venture capital, and writes investigative AI journalism under the
                alias <strong className="text-sa9-pink">Space Pirate Zero</strong>.
                His work has been covered by Forbes, Fortune, BBC, VICE,
                VentureBeat, and Google.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="https://calendar.app.google/1J6UnuYJYhrd8Vc87" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md" data-cta="press:book-speaker">
                  Book as a Speaker →
                </Button>
              </a>
              <Link href="/about">
                <Button variant="secondary" size="md" data-cta="press:full-bio">
                  Full Bio
                </Button>
              </Link>
            </div>
          </div>

          {/* Fast facts */}
          <div className="border-3 border-sa9-border bg-sa9-surface-raised p-6 sm:p-8 shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest text-sa9-pink mb-6">
              Fast Facts
            </h3>
            <dl className="space-y-4">
              {FAST_FACTS.map((f) => (
                <div key={f.label} className="grid grid-cols-[110px_1fr] gap-4 border-b border-sa9-border/50 pb-3 last:border-0">
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim pt-0.5">
                    {f.label}
                  </dt>
                  <dd className="text-sa9-text text-sm leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ KEYNOTE VIDEOS ══ */}
      <AnimatedSection className="py-16 sm:py-20 border-t-3 border-sa9-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-1 h-12 bg-sa9-pink flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                Keynote Videos
                <span className="font-mono text-xs text-sa9-text-dim ml-3">({videos.length})</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mt-1">
                Conference talks and keynotes on enterprise AI strategy and
                connected commerce.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="border-3 border-sa9-border bg-sa9-surface-raised shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                <div className="relative w-full aspect-video overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {video.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                    <span className="font-mono text-[10px] text-sa9-text-dim">{formatDate(video.date)}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-sa9-text mb-2">{video.title}</h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed">{video.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ PRESS FEATURES ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-raised py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-1 h-12 bg-sa9-cyan flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                Press Features
                <span className="font-mono text-xs text-sa9-text-dim ml-3">({pressItems.length})</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mt-1">
                Coverage from Forbes, Fortune, BBC, VICE, VentureBeat, Google,
                and more.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pressItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-6 border-3 border-sa9-border bg-sa9-surface hover:border-sa9-pink p-6 transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_#990044]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="cyan">{getPublication(item.url)}</Badge>
                    <span className="font-mono text-[10px] text-sa9-text-dim">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="font-display font-bold text-sa9-text group-hover:text-sa9-pink transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed line-clamp-2">{item.summary}</p>
                </div>
                <span className="hidden sm:block text-sa9-text-dim group-hover:text-sa9-pink transition-colors text-lg flex-shrink-0">
                  &#x2192;
                </span>
              </a>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ PATENTS ══ */}
      <AnimatedSection className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-1 h-12 bg-sa9-green flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                U.S. Patents
                <span className="font-mono text-xs text-sa9-text-dim ml-3">({patents.length})</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mt-1">
                Granted inventions in AI, IoT, and security systems.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {patents.map((patent) => (
              <a
                key={patent.id}
                href={patent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-3 border-sa9-border bg-sa9-surface-raised hover:border-sa9-green p-6 transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_#1a5c00] flex flex-col"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {patent.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-display font-bold text-sa9-text group-hover:text-sa9-green transition-colors mb-2">
                  {patent.title}
                </h3>
                <p className="text-sa9-text-muted text-sm leading-relaxed flex-1">{patent.summary}</p>
                <div className="font-mono text-xs text-sa9-text-dim mt-4">Filed {formatDate(patent.date)}</div>
              </a>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ BOOK ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-raised py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-3 border-sa9-pink bg-sa9-surface p-6 sm:p-10 shadow-[6px_6px_0_#990044] grid md:grid-cols-[200px_1fr] gap-8 items-start">
            <div className="relative w-full aspect-[2/3] max-w-[200px] mx-auto md:mx-0 border-3 border-sa9-border overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
              <Image
                src={book.image}
                alt={`${book.title} book cover — by Greg Chambers`}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
            <div>
              <Badge variant="pink" className="mb-3">{book.status.toUpperCase()}</Badge>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-2">
                {book.title}
              </h2>
              <p className="text-sa9-text leading-relaxed mb-3">{book.description}</p>
              <p className="text-sa9-text-muted text-sm leading-relaxed mb-5">{book.summary}</p>
              {book.links?.length ? (
                <div className="flex flex-wrap gap-3">
                  {book.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="sm" data-cta={`press:book-${l.label.toLowerCase()}`}>
                        {l.label} →
                      </Button>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ FAQ (SEO + FAQPage schema) ══ */}
      <AnimatedSection className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="cyan" className="mb-4">
            FREQUENTLY ASKED
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-10">
            About <span className="text-sa9-cyan">Greg Chambers</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group border-3 border-sa9-border bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] open:border-sa9-cyan transition-colors"
              >
                <summary className="font-display font-bold text-base sm:text-lg text-sa9-text cursor-pointer list-none flex items-start justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-sa9-cyan font-mono text-xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-sa9-text-muted text-sm sm:text-base leading-relaxed mt-4">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="py-20 border-t-3 border-sa9-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            Press &amp; speaking <span className="text-sa9-pink">inquiries</span>?
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8 max-w-xl mx-auto">
            For interviews, keynote bookings, or collaboration — reach the ship.
            Replies within 48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                GET IN TOUCH →
              </Button>
            </Link>
            <Link href="/studio">
              <Button variant="secondary" size="lg">
                READ DISPATCHES
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
