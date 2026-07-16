import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { consulting } from "@/lib/consulting";

export const metadata: Metadata = {
  title: "Enterprise AI Consulting — Governed and Shipped | Spaceship Alpha 9",
  keywords: ["enterprise AI consulting","AI strategy","governed AI","retail marketing automation","MCP tool rails","compliance-as-code","AI consultant Atlanta","Greg Chambers","Fortune 500 AI"],
  description:
    "Enterprise-grade AI, architected and compliant. The same crew that ships consumer software wires governed AI into Fortune 500 infrastructure — retail marketing automation, MCP tool rails, compliance-as-code.",
  alternates: { canonical: "/consulting" },
  openGraph: {
    title: "Enterprise AI, Governed and Shipped | Spaceship Alpha 9",
    description:
      "Strategy first, then working, compliant systems. 15,000+ stores deployed. 3 U.S. patents. The bridge between corporate infrastructure and consumer magic.",
    images: [{ url: "/images/scenes/09-enterprise.png", width: 1200, height: 630 }],
  },
};

const outcomes = [
  { value: "15K+", label: "Stores deployed globally" },
  { value: "$600M+", label: "Incremental revenue driven" },
  { value: "215", label: "Governed API operations wired" },
  { value: "3", label: "U.S. patents granted" },
];

const process = [
  {
    step: "01",
    title: "Strategy",
    detail:
      "We map the terrain first — where AI actually moves the needle, where it's theater, and what governance the business needs before a single model touches production.",
  },
  {
    step: "02",
    title: "Architecture",
    detail:
      "Declarative systems whose documents ARE the deployment. Durable orchestration, MCP tool rails, and compliance enforced structurally — not in a policy PDF nobody reads.",
  },
  {
    step: "03",
    title: "Ship",
    detail:
      "Working software in your infrastructure, pinned by tests, handed off with the rails to run it. No slideware. No pilot purgatory. Systems that survive contact with the org.",
  },
];

export default function ConsultingPage() {
  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b-3 border-sa9-border">
        <div className="absolute inset-0">
          <Image
            src="/images/scenes/09-enterprise.png"
            alt="Spaceship Alpha 9 enterprise engagement"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sa9-surface via-sa9-surface/85 to-sa9-surface/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-sa9-surface via-transparent to-transparent" />
        </div>
        <div className="absolute inset-0 data-grid-bg opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
          <Badge variant="cyan" className="mb-6">
            ENTERPRISE AI PRACTICE
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.92] mb-6 max-w-4xl">
            <span className="text-sa9-text">Governed AI,</span>{" "}
            <span className="text-sa9-cyan animate-cyan-pulse">shipped.</span>
          </h1>
          <p className="text-sa9-text-muted text-lg sm:text-xl max-w-2xl leading-relaxed mb-8">
            {consulting.positioning}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="https://calendar.app.google/1J6UnuYJYhrd8Vc87" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg" data-cta="consulting-hero-email">
                BOOK AN INTRO CALL →
              </Button>
            </a>
            <Link href="#engagements">
              <Button variant="ghost" size="lg" data-cta="consulting-hero-work">
                SEE THE WORK
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ OUTCOMES BAND ══ */}
      <section className="border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {outcomes.map((o) => (
            <div key={o.label} className="text-center sm:text-left">
              <div className="font-display font-black text-3xl sm:text-4xl text-sa9-cyan mb-1">
                {o.value}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-sa9-text-dim leading-tight">
                {o.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW WE WORK ══ */}
      <AnimatedSection className="py-20 sm:py-24 border-b-3 border-sa9-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="pink" className="mb-4">
            HOW WE WORK
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-12 max-w-3xl">
            Strategy first. Then{" "}
            <span className="text-sa9-pink">systems that ship.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {process.map((p) => (
              <div
                key={p.step}
                className="border-3 border-sa9-border bg-sa9-surface-raised p-8 shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
              >
                <div className="font-display font-black text-4xl text-sa9-cyan mb-4">
                  {p.step}
                </div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-sa9-text mb-3">
                  {p.title}
                </h3>
                <p className="text-sa9-text-muted text-sm leading-relaxed">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CAPABILITIES ══ */}
      <AnimatedSection className="py-16 sm:py-20 border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="cyan" className="mb-6">
            CAPABILITIES
          </Badge>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {consulting.capabilities.map((c, i) => (
              <div
                key={c}
                className="border-3 border-sa9-border bg-sa9-surface p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] flex items-center gap-4"
              >
                <span className="font-display font-black text-2xl text-sa9-pink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display font-bold text-sm uppercase tracking-wide text-sa9-text">
                  {c}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ ENGAGEMENTS ══ */}
      <AnimatedSection id="engagements" className="py-20 sm:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="cyan" className="mb-4">
            SELECTED ENGAGEMENTS
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-12">
            Working <span className="text-sa9-cyan">systems</span>, not slideware
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {consulting.engagements.map((e) => (
              <div
                key={e.name}
                className="border-3 border-sa9-border bg-sa9-surface-raised p-8 shadow-[6px_6px_0_rgba(0,0,0,0.6)] flex flex-col"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-cyan mb-3">
                  {e.label}
                </div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-sa9-text mb-1">
                  {e.name}
                </h3>
                <p className="text-sa9-pink text-sm italic mb-4">{e.tagline}</p>
                <p className="text-sa9-text-muted text-sm leading-relaxed mb-5 flex-1">
                  {e.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {e.stack.map((s) => (
                    <span key={s} className="stack-badge text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CREDENTIALS ══ */}
      <AnimatedSection className="py-20 sm:py-24 border-y-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Badge variant="pink" className="mb-4">
              PRIOR WORK
            </Badge>
            <p className="text-sa9-text-muted text-lg leading-relaxed">
              {consulting.prior}
            </p>
          </div>
          <div>
            <Badge variant="cyan" className="mb-4">
              PATENTS
            </Badge>
            <ul className="space-y-3">
              {consulting.patents.map((p) => (
                <li
                  key={p}
                  className="font-mono text-sm text-sa9-text border-l-3 border-sa9-cyan pl-4"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-sa9-pink/[0.06] via-transparent to-sa9-cyan/[0.05]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge variant="pink" className="mb-6">
            LET&apos;S BUILD
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-sa9-text mb-4 leading-[0.95]">
            Bring us the{" "}
            <span className="text-sa9-cyan">hard problem</span>
          </h2>
          <p className="text-sa9-text-muted text-lg mb-10 max-w-xl mx-auto">
            Strategy first, then working, compliant systems. If it can be built,
            we ship it. Tell us where the org is stuck.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://calendar.app.google/1J6UnuYJYhrd8Vc87" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg" data-cta="consulting-cta-email">
                BOOK AN INTRO CALL →
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="secondary" size="lg" data-cta="consulting-cta-contact">
                SEND A BRIEF
              </Button>
            </Link>
          </div>
          <p className="font-mono text-xs text-sa9-text-dim mt-8 tracking-wide">
            {"// zero@spacepiratezero.com · Atlanta, GA · replies within 48h"}
          </p>
        </div>
      </section>
    </>
  );
}
