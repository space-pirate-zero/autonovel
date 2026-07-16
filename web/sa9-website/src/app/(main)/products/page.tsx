import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/products";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { breadcrumbJsonLd } from "@/lib/structured-data";

const productCount = products.filter((p) => p.id !== "spz").length;

export const metadata: Metadata = {
  title: "Products — 6 AI-Native Apps, Tools & Platforms | Spaceship Alpha 9",
  description:
    "Explore all 6 AI-native products from Spaceship Alpha 9: StyleLift (AI fashion), GhostDeck (macOS VMs), OSMIX (AI music sessions), DARKWAVE (Kubernetes), TradeCraft (counter-surveillance), and Brand Casino. One indie studio. Zero VC. All shipping.",
  keywords: [
    "AI apps", "indie software studio", "StyleLift", "GhostDeck", "OSMIX",
    "DARKWAVE", "TradeCraft", "AI music", "AI fashion", "Spaceship Alpha 9",
    "bootstrapped startup", "AI-native products",
  ],
  alternates: { canonical: "/products" },
  openGraph: {
    title: "SA9 Product Fleet — 6 AI-Native Products",
    description:
      "Consumer apps, developer tools, AI music, infrastructure, and counter-surveillance. All built from one studio. All shipping.",
    images: [{ url: "/api/og?title=Product+Fleet&subtitle=6+AI-Native+Products,+Zero+VC&type=products", width: 1200, height: 630 }],
  },
};

export default function ProductsPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Products", url: "https://spaceshipalpha9.co/products" },
  ]);

  const statusCounts = {
    beta: products.filter((p) => p.status === "beta" && p.id !== "spz").length,
    development: products.filter((p) => p.status === "development" && p.id !== "spz").length,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      {/* ══ HERO — with scene art ══ */}
      <section data-section="products-hero" className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-sa9-pink/[0.05] via-transparent to-sa9-cyan/[0.05]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 max-w-2xl">
              <Badge variant="pink" className="mb-4">FLEET MANIFEST</Badge>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-6 leading-[0.9]">
                Every ship
                <br />
                <span className="text-sa9-pink">in the armada.</span>
              </h1>
              <p className="text-sa9-text-muted text-lg max-w-xl mb-8">
                {productCount} AI-native products — fashion intelligence, VM
                orchestration, AI music, Kubernetes, counter-surveillance, and
                proximity marketing. AI woven into the core, not bolted on. All
                from one home office in Atlanta.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="stack-badge">{statusCounts.beta} in beta</span>
                <span className="stack-badge">{statusCounts.development} in development</span>
                <span className="stack-badge">$0 raised</span>
                <span className="stack-badge">100% independent</span>
              </div>
            </div>
            <div className="flex-shrink-0 relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[24rem] lg:h-[24rem]">
              <Image
                src="/images/scenes/10-studio.png"
                alt="Spaceship Alpha 9 fleet"
                fill
                className="object-contain animate-float drop-shadow-[0_0_40px_rgba(255,20,147,0.25)]"
                sizes="(max-width: 1024px) 320px, 384px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ THE FLEET — graphical, screenshot-driven grid ══ */}
      <AnimatedSection data-section="fleet-grid" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-10">
            <div className="w-1 h-12 bg-sa9-pink flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text">
                The <span className="text-sa9-pink">fleet</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mt-1 max-w-lg">
                Tap any product to launch its site. Real screenshots, real
                shipping software.
              </p>
            </div>
          </div>
          <ProductGrid products={products} />
        </div>
      </AnimatedSection>

      {/* ══ OSMIX / ATOMIC LEGACY FEATURE ══ */}
      <AnimatedSection data-section="osmix-feature" className="border-y-3 border-sa9-border bg-sa9-surface-raised py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-sa9-purple/[0.06] via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 max-w-2xl">
              <Badge variant="cyan" className="mb-4">NEW FLAGSHIP · FROM THE ATOMIC SUITE</Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4 leading-tight">
                Suno gives you stems.{" "}
                <span className="text-sa9-purple">Osmix gives you a session.</span>
              </h2>
              <p className="text-sa9-text-muted text-lg leading-relaxed mb-6">
                The music tooling SA9 pioneered as Atomic Sound, Video, and Distro
                grew up into <strong className="text-sa9-text">OSMIX</strong> — one
                Rust engine that turns an AI-generated track into a real multi-DAW
                session: separated stems, drum classification, tempo map, MIDI, and
                a master tuned to your destination&apos;s loudness target. Real DSP,
                185+ passing tests.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/sites/osmix" target="_blank" rel="noopener noreferrer" data-cta="products:osmix">
                  <Button variant="primary" size="lg">EXPLORE OSMIX →</Button>
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 relative w-64 h-64 sm:w-80 sm:h-80 border-3 border-sa9-border overflow-hidden">
              <Image
                src="/images/scenes/05-osmix.png"
                alt="OSMIX — AI music sessions"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 256px, 320px"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section data-section="products-cta" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            Want early access &amp; the <span className="text-sa9-pink">drops</span>?
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8">
            Beta invites, product launches, and dispatches from the outer edge.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/waitlist" data-cta="products:waitlist">
              <Button variant="primary" size="lg">JOIN THE WAITLIST</Button>
            </Link>
            <a href="https://spacepiratezero.substack.com" target="_blank" rel="noopener noreferrer" data-cta="products:substack">
              <Button variant="secondary" size="lg">SUBSCRIBE TO DISPATCHES</Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
