import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { products } from "@/lib/products";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { SignalTicker } from "@/components/sections/SignalTicker";
import { SpotlightHero } from "@/components/sections/SpotlightHero";
import { TransmissionCard } from "@/components/sections/TransmissionCard";
import { SignupForm } from "@/components/forms/SignupForm";
import { BouncingCaptain } from "@/components/CaptainFace";
import { Carousel } from "@/components/ui/Carousel";
import { getDispatches } from "@/lib/substack-live";
import { albums } from "@/lib/music";
import { transmissions, streamingNow } from "@/lib/transmissions";
import { consulting } from "@/lib/consulting";

const featuredIds = [
  "stylelift",
  "ghostdeck",
  "osmix",
  "darkwave",
  "tradecraft",
  "brand-casino",
];

export default async function HomePage() {
  const productCount = products.filter((p) => p.id !== "spz").length;
  const featured = products.filter((p) => featuredIds.includes(p.id));
  const platforms = new Set(products.flatMap((p) => p.platforms));
  const liveDispatches = await getDispatches();
  const sortedAlbums = [...albums].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* ══ DVD BOUNCING CAPTAIN ══ */}
      <BouncingCaptain />

      {/* ══ HERO — the studio's triple identity ══ */}
      <section className="relative overflow-hidden border-b-3 border-sa9-border min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-sa9-pink/[0.03] via-transparent to-sa9-cyan/[0.02]" />
        <div className="absolute inset-0 data-grid-bg" />
        <div
          className="absolute left-0 w-full h-px opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, #ff1493, transparent)",
            animation: "scanDown 4s linear infinite",
            top: "0%",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 relative w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                <Badge variant="pink">SYSTEM: ONLINE</Badge>
                <Badge variant="cyan">ATLANTA, GA</Badge>
                <Badge variant="default">EST. 2024</Badge>
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-8xl uppercase tracking-tight leading-[0.9] mb-8 animate-text-reveal">
                <span className="text-sa9-pink animate-neon-pulse block">
                  AI THAT
                </span>
                <span className="text-sa9-text block">DOESN&apos;T</span>
                <span className="text-sa9-cyan animate-cyan-pulse block">
                  SUCK.
                </span>
              </h1>

              <p className="text-sa9-text-muted text-lg sm:text-xl max-w-xl mb-4 leading-relaxed font-body">
                One bootstrapped studio in Atlanta with three arms: we{" "}
                <strong className="text-sa9-text">ship software</strong>, we{" "}
                <strong className="text-sa9-pink">tell stories</strong>, and we
                wire <strong className="text-sa9-cyan">governed AI</strong> into
                the enterprise. {productCount} products. A full-cast audio series streaming now.
                Zero venture capital.
              </p>

              <p className="font-mono text-sm text-sa9-pink mb-8 tracking-wide">
                {"// no algorithms. no noise. just shipping."}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button variant="primary" size="lg">
                    EXPLORE THE FLEET
                  </Button>
                </Link>
                <Link href="/studio">
                  <Button variant="cyan" size="lg">
                    THE STUDIO
                  </Button>
                </Link>
                <Link href="/manifesto">
                  <Button variant="secondary" size="lg">
                    MANIFESTO
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t-3 border-sa9-border/30">
                <p className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-3">
                  Join the waitlist — beta invites & dispatches
                </p>
                <SignupForm type="waitlist" />
              </div>
            </div>

            <div className="flex-shrink-0 relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[520px] lg:h-[520px]">
              <Image
                src="/images/hero-ship-v4.webp"
                alt="Spaceship Alpha 9 — AI-native indie software studio spaceship"
                fill
                className="object-contain drop-shadow-[0_0_45px_rgba(255,20,147,0.35)] animate-float"
                priority
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 384px, 520px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMMAND BAR ══ */}
      <section
        className="border-b-3 border-sa9-border bg-sa9-surface-raised"
        aria-label="Studio metrics"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x-3 divide-sa9-border">
            {[
              { value: String(productCount), label: "Products Shipping" },
              { value: String(streamingNow.length), label: "Live Audio Series" },
              { value: String(platforms.size), label: "Platforms" },
              { value: "$0", label: "VC Raised" },
              { value: "100%", label: "Independent" },
            ].map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center">
                <div className="font-display font-black text-2xl sm:text-3xl text-sa9-pink">
                  {stat.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-muted mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SIGNAL TICKER ══ */}
      <SignalTicker />

      {/* ══ SPOTLIGHT — rotating featured (TLHC / StyleLift / DI / OSMIX) ══ */}
      <SpotlightHero />

      {/* ══ THREE ARMS OF THE STUDIO ══ */}
      <AnimatedSection className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <Badge variant="cyan" className="mb-4">
              ONE STUDIO · THREE ARMS
            </Badge>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-sa9-text leading-tight mb-6">
              We build the future,{" "}
              <span className="text-sa9-pink">tell its story</span>, and ship it
              to the enterprise.
            </h2>
            <p className="text-sa9-text-muted text-lg leading-relaxed">
              Spaceship Alpha 9 is a software studio, a storytelling studio, and
              an enterprise AI practice — run out of one salvage deck in Atlanta.
              Greg architects the intelligence. Daniela engineers the empathy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Software Studio",
                kicker: `${productCount} products`,
                desc: "Consumer apps, developer tools, platforms, games, and infrastructure — AI woven into the core, not bolted on. From fashion intelligence to counter-surveillance.",
                color: "border-sa9-pink",
                icon: "🚀",
                href: "/products",
                cta: "See the fleet",
              },
              {
                title: "Storytelling Studio",
                kicker: "streaming now + more",
                desc: "Original IP transmitted from the ship: a full-cast audiobook streaming now, a 24-door audio drama, a field course, a field manual, and a 24-track album.",
                color: "border-sa9-cyan",
                icon: "📡",
                href: "/studio",
                cta: "Tune in",
              },
              {
                title: "Enterprise AI",
                kicker: "governed & shipped",
                desc: "Enterprise-grade AI, architected and compliant. Retail marketing automation, MCP tool rails, compliance-as-code. The bridge between corporate infrastructure and consumer magic.",
                color: "border-sa9-green",
                icon: "🛰️",
                href: "/consulting",
                cta: "Work with us",
              },
            ].map((arm) => (
              <Link key={arm.title} href={arm.href}>
                <div
                  className={`h-full border-3 ${arm.color} bg-sa9-surface-raised p-8 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col`}
                >
                  <span className="text-3xl mb-4 block">{arm.icon}</span>
                  <h3 className="font-display font-bold text-xl uppercase tracking-wider text-sa9-text mb-1">
                    {arm.title}
                  </h3>
                  <p className="font-mono text-xs text-sa9-pink mb-3">
                    {arm.kicker}
                  </p>
                  <p className="text-sa9-text-muted text-sm leading-relaxed flex-1">
                    {arm.desc}
                  </p>
                  <p className="font-mono text-xs uppercase tracking-widest text-sa9-cyan mt-5">
                    {arm.cta} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ FEATURED PRODUCTS ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-card py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge variant="pink" className="mb-4">
                FLEET MANIFEST
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text">
                Featured <span className="text-sa9-pink">Products</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mt-3 max-w-lg">
                {productCount} products spanning consumer apps, developer tools,
                AI platforms, games, and infrastructure — all from one studio.
              </p>
            </div>
            <Link href="/products" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                View All {productCount} →
              </Button>
            </Link>
          </div>

          <ProductGrid products={featured} />

          <div className="mt-10 text-center">
            <Link href="/products">
              <Button variant="secondary" size="lg">
                SEE ALL {productCount} PRODUCTS →
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ STORYTELLING STUDIO — TRANSMISSIONS ══ */}
      <AnimatedSection className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sa9-cyan/[0.03] via-transparent to-sa9-pink/[0.03]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-end justify-between mb-4">
            <div>
              <Badge variant="cyan" className="mb-4">
                THE STORYTELLING STUDIO
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-sa9-text leading-tight">
                Transmissions from <span className="text-sa9-cyan">the ship</span>
              </h2>
            </div>
            <Link href="/studio" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                All Transmissions →
              </Button>
            </Link>
          </div>
          <p className="text-sa9-text-muted text-lg max-w-2xl mb-12 leading-relaxed">
            The premier AI storytelling studio in the South. Two full-cast audio
            series are streaming now — narrated by Space Pirate Zero.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transmissions.map((t) => (
              <TransmissionCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ THE CAPTAIN ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-raised py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
            <div className="flex-shrink-0 relative w-48 h-48 md:w-72 md:h-72 group">
              <div
                className="captain-circle relative w-full h-full overflow-hidden border-[5px] border-sa9-cyan animate-float group-hover:animate-glitch"
                style={{
                  boxShadow:
                    "0 0 30px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.15)",
                }}
              >
                <Image
                  src="/images/captain-face.png"
                  alt="Space Pirate Zero — The Captain"
                  fill
                  className="object-cover object-top group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 192px, 288px"
                />
              </div>
              <div className="captain-circle absolute inset-[-4px] animate-border-glow pointer-events-none border-[3px]" />
            </div>
            <div className="flex-1 max-w-2xl">
              <Badge variant="cyan" className="mb-4">
                THE CAPTAIN
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-6">
                Space Pirate Zero.{" "}
                <span className="text-sa9-cyan">Builder. Writer. Insurgent.</span>
              </h2>
              <p className="text-sa9-text-muted text-lg mb-4 leading-relaxed">
                <strong className="text-sa9-text">Greg Chambers</strong> — a.k.a.{" "}
                <strong className="text-sa9-text">Space Pirate Zero</strong> — is an{" "}
                <strong className="text-sa9-text">
                  enterprise AI strategist, multi-patent inventor, and AI
                  consultant
                </strong>{" "}
                turned indie builder. As former{" "}
                <strong className="text-sa9-text">
                  Global Group Director of Digital Innovation at The Coca-Cola
                  Company
                </strong>
                , he deployed AI across 15,000+ retail locations and set a{" "}
                <strong className="text-sa9-text">Guinness World Record</strong>{" "}
                with the world&apos;s first 3D robotic billboard in Times Square.
                Co-inventor on two U.S. patents. Today he ships {productCount}{" "}
                <strong className="text-sa9-text">AI-native products</strong> — and
                a universe of original IP — from a home office in{" "}
                <strong className="text-sa9-text">Atlanta, Georgia</strong>.
              </p>
              <p className="text-sa9-text-muted text-lg mb-8 leading-relaxed">
                As Space Pirate Zero he writes{" "}
                <strong className="text-sa9-text">
                  investigative AI journalism
                </strong>{" "}
                on Substack, records six albums of cosmic lo-fi, and narrates
                full-cast audiobooks. Available for{" "}
                <strong className="text-sa9-text">
                  enterprise AI consulting, AI strategy, and keynote speaking
                </strong>
                . Deploys on Fridays. Intelligence should be embedded in the
                product — not bolted on after the fact.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dispatches">
                  <Button variant="primary" size="sm">
                    READ DISPATCHES
                  </Button>
                </Link>
                <a
                  href="https://linkedin.com/in/gregchambers/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    LINKEDIN
                  </Button>
                </a>
                <Link href="/about">
                  <Button variant="ghost" size="sm">
                    FULL DOSSIER →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ ENTERPRISE CONSULTING ══ */}
      <AnimatedSection className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <Badge variant="default" className="mb-4">
              ENTERPRISE AI
            </Badge>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-5 leading-tight">
              The same crew ships{" "}
              <span className="text-sa9-cyan">governed AI</span> for the Fortune
              500.
            </h2>
            <p className="text-sa9-text-muted text-lg leading-relaxed">
              {consulting.positioning}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            {consulting.capabilities.map((c) => (
              <span key={c} className="stack-badge">
                {c}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consulting.engagements.map((e) => (
              <div
                key={e.name}
                className="border-3 border-sa9-border bg-sa9-surface-raised p-8 shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-cyan mb-3">
                  {e.label}
                </div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-sa9-text mb-1">
                  {e.name}
                </h3>
                <p className="text-sa9-pink text-sm italic mb-4">{e.tagline}</p>
                <p className="text-sa9-text-muted text-sm leading-relaxed mb-5">
                  {e.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {e.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] uppercase tracking-wide text-sa9-text-dim border-3 border-sa9-border/60 px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/consulting">
              <Button variant="secondary" size="lg">
                ENTERPRISE CAPABILITIES →
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ MANIFESTO TEASER ══ */}
      <section className="relative border-y-3 border-sa9-pink overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sa9-pink/[0.04] via-transparent to-sa9-cyan/[0.04]" />
        <div className="absolute inset-0 data-grid-bg opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="pink" className="mb-6">
              THE MANIFESTO
            </Badge>
            <blockquote className="font-display font-black text-2xl sm:text-3xl lg:text-5xl uppercase tracking-tight text-sa9-text leading-tight mb-8">
              &ldquo;We didn&apos;t build a tool.
              <br />
              We built a{" "}
              <span className="text-sa9-pink animate-neon-pulse">
                consciousness
              </span>
              .&rdquo;
            </blockquote>
            <p className="text-sa9-text-muted text-lg mb-10 max-w-xl mx-auto">
              Eight principles for building software without asking permission.
              No VC. No compromise. The Tiffany lamp, not the fluorescent tube.
            </p>
            <Link href="/manifesto">
              <Button variant="cyan" size="lg">
                READ THE FULL MANIFESTO
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MUSIC PREVIEW ══ */}
      <AnimatedSection className="border-b-3 border-sa9-border bg-sa9-surface py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="cyan" className="mb-3">
                SIGNAL_BROADCAST
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text">
                Music from <span className="text-sa9-cyan">the Cosmos</span>
              </h2>
            </div>
            <Link href="/music" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                All Albums →
              </Button>
            </Link>
          </div>
          <Carousel ariaLabel="Albums by Space Pirate Zero">
            {sortedAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/music/${album.slug}`}
                className="group border-3 border-sa9-border bg-sa9-surface-raised hover:border-sa9-cyan transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_rgba(0,240,255,0.2)] flex flex-col h-full"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={album.image}
                    alt={album.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 80vw, 32vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wide text-sa9-text group-hover:text-sa9-cyan transition-colors mb-1">
                    {album.title}
                  </h3>
                  <p className="font-mono text-xs text-sa9-text-dim">
                    {album.tracks.length} tracks
                  </p>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </AnimatedSection>

      {/* ══ DISPATCHES PREVIEW ══ */}
      <AnimatedSection className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="pink" className="mb-3">
                SUBSTACK_DISPATCHES
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text">
                Latest <span className="text-sa9-pink">Dispatches</span>
              </h2>
            </div>
            <Link href="/dispatches" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                All Dispatches →
              </Button>
            </Link>
          </div>
          <Carousel ariaLabel="Latest Substack dispatches">
            {liveDispatches.map((dispatch) => (
              <a
                key={dispatch.rss_guid || dispatch.id}
                href={dispatch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-3 border-sa9-border bg-sa9-surface-raised hover:border-sa9-pink transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_#990044] flex flex-col h-full"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={dispatch.image}
                    alt={dispatch.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 80vw, 32vw"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-base text-sa9-text group-hover:text-sa9-pink transition-colors mb-2 uppercase tracking-wide line-clamp-2">
                    {dispatch.title}
                  </h3>
                  <p className="text-sa9-text-muted text-sm line-clamp-2 flex-1">
                    {dispatch.summary}
                  </p>
                  <div className="font-mono text-xs text-sa9-text-dim mt-3">
                    {dispatch.date
                      ? new Date(dispatch.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </div>
                </div>
              </a>
            ))}
          </Carousel>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t-3 border-sa9-border">
        <div className="absolute inset-0 bg-gradient-to-t from-sa9-pink/[0.03] via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-sa9-text mb-4">
            Ready to{" "}
            <span className="text-sa9-pink animate-neon-pulse">board</span>?
          </h2>
          <p className="text-sa9-text-muted text-lg mb-10 max-w-xl mx-auto">
            Beta invites, AI dispatches, and product drops. No algorithms. No
            noise. Just signal from Space Pirate Zero.
          </p>
          <div className="flex justify-center mb-8">
            <SignupForm type="newsletter" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/space-pirate-zero"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                GITHUB
              </Button>
            </a>
            <a
              href="https://linkedin.com/company/spaceship-alpha-9"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="lg">
                LINKEDIN
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
