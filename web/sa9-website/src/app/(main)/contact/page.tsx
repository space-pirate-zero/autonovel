import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SocialIcon, type IconName } from "@/components/ui/SocialIcon";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Hail the Ship | Spaceship Alpha 9",
  keywords: ["contact Spaceship Alpha 9","Space Pirate Zero contact","AI studio collaboration","press inquiry","enterprise AI consulting contact","Atlanta"],
  description:
    "Reach Spaceship Alpha 9 and Space Pirate Zero. Collaborations, press, partnerships, enterprise AI engagements, or just say hi. Email, Substack, GitHub, LinkedIn, Bluesky, and X.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Hail the Ship — Contact Spaceship Alpha 9",
    description:
      "Collaborations, press, enterprise AI, or just want to say hi? Open a channel. We respond within 48h.",
    images: [{ url: "/images/contact/comms.webp", width: 880, height: 880 }],
  },
};

const channels: {
  label: string;
  value: string;
  href: string;
  icon: IconName;
  desc: string;
  accent: "pink" | "cyan";
}[] = [
  {
    label: "Substack",
    value: "spacepiratezero.substack.com",
    href: "https://spacepiratezero.substack.com",
    icon: "substack",
    desc: "Investigative AI dispatches + studio updates",
    accent: "pink",
  },
  {
    label: "LinkedIn",
    value: "in/gregchambers",
    href: "https://www.linkedin.com/in/gregchambers/",
    icon: "linkedin",
    desc: "Enterprise, partnerships, and company news",
    accent: "cyan",
  },
  {
    label: "GitHub",
    value: "space-pirate-zero",
    href: "https://github.com/space-pirate-zero",
    icon: "github",
    desc: "Open-source projects and code",
    accent: "pink",
  },
  {
    label: "Bluesky",
    value: "@spacepiratezero",
    href: "https://bsky.app/profile/spacepiratezero.bsky.social",
    icon: "bluesky",
    desc: "Short-form thoughts, building in public",
    accent: "cyan",
  },
  {
    label: "X / Twitter",
    value: "@SpacePirateZero",
    href: "https://x.com/SpacePirateZero",
    icon: "x",
    desc: "Quick updates and industry commentary",
    accent: "pink",
  },
];

export default function ContactPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Contact", url: "https://spaceshipalpha9.co/contact" },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative grid lg:grid-cols-[1fr_0.8fr] gap-10 lg:gap-16 items-center">
          <div>
            <Badge variant="pink" className="mb-6">
              COMMS · CHANNEL OPEN
            </Badge>
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-6 leading-[0.9]">
              Hail the{" "}
              <span className="text-sa9-pink animate-neon-pulse">Ship.</span>
            </h1>
            <p className="text-sa9-text-muted text-lg max-w-xl mb-8 leading-relaxed">
              Collaboration, press, partnership, an enterprise AI problem, or
              just want to say hi? Open a channel below or transmit direct.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <a href="mailto:zero@spacepiratezero.com?subject=Hailing%20Spaceship%20Alpha%209">
                <Button variant="primary" size="lg" data-cta="contact-hero-email">
                  TRANSMIT DIRECT →
                </Button>
              </a>
              <a href="https://calendar.app.google/1J6UnuYJYhrd8Vc87" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" data-cta="contact-hero-book">
                  BOOK A CALL
                </Button>
              </a>
            </div>
            <p className="font-mono text-sm text-sa9-cyan tracking-wide mt-3">
              zero@spacepiratezero.com
            </p>
            <p className="font-mono text-xs text-sa9-text-dim mt-6 tracking-wide">
              {"// Atlanta, GA · replies within 48h · no auto-responders"}
            </p>
          </div>

          <div className="relative aspect-square w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto border-3 border-sa9-cyan overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,0.6)]">
            <Image
              src="/images/contact/comms.webp"
              alt="Spaceship Alpha 9 broadcasting a transmission"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 380px"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-sa9-surface to-transparent h-16" />
            <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-widest text-sa9-cyan">
              ● SIGNAL LOCKED
            </span>
          </div>
        </div>
      </section>

      {/* ══ CHANNELS + FORM ══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16">
          {/* Direct channels */}
          <div>
            <Badge variant="cyan" className="mb-6">
              OPEN CHANNELS
            </Badge>
            <div className="space-y-3">
              {channels.map((c) => {
                const isPink = c.accent === "pink";
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta={`contact:${c.label}`}
                    className={`group flex items-center gap-4 border-3 border-sa9-border bg-sa9-surface-raised p-4 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 ${
                      isPink
                        ? "hover:border-sa9-pink hover:shadow-[6px_6px_0_#990044]"
                        : "hover:border-sa9-cyan hover:shadow-[6px_6px_0_#006680]"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-11 h-11 flex-shrink-0 border-3 border-sa9-border bg-sa9-surface transition-colors ${
                        isPink
                          ? "text-sa9-text-muted group-hover:text-sa9-pink group-hover:border-sa9-pink"
                          : "text-sa9-text-muted group-hover:text-sa9-cyan group-hover:border-sa9-cyan"
                      }`}
                    >
                      <SocialIcon name={c.icon} className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`font-display font-bold text-sm uppercase tracking-widest text-sa9-text transition-colors ${
                            isPink
                              ? "group-hover:text-sa9-pink"
                              : "group-hover:text-sa9-cyan"
                          }`}
                        >
                          {c.label}
                        </span>
                        <span className="font-mono text-[11px] text-sa9-text-dim truncate hidden sm:inline">
                          {c.value}
                        </span>
                      </div>
                      <p className="text-sa9-text-muted text-xs mt-0.5">{c.desc}</p>
                    </div>
                    <span
                      className={`text-sa9-text-dim transition-colors ${
                        isPink ? "group-hover:text-sa9-pink" : "group-hover:text-sa9-cyan"
                      }`}
                    >
                      →
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Enterprise cross-link */}
            <div className="mt-6 border-3 border-sa9-pink bg-sa9-surface p-6 shadow-[6px_6px_0_#990044]">
              <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-pink mb-2">
                ENTERPRISE
              </div>
              <p className="text-sa9-text text-sm leading-relaxed mb-4">
                Got a governed-AI problem at Fortune-500 scale? That has its own
                bridge.
              </p>
              <Link href="/consulting">
                <Button variant="ghost" size="sm" data-cta="contact:consulting">
                  ENTERPRISE AI PRACTICE →
                </Button>
              </Link>
            </div>
          </div>

          {/* Form panel */}
          <div>
            <Badge variant="pink" className="mb-6">
              SEND A TRANSMISSION
            </Badge>
            <div className="border-3 border-sa9-border bg-sa9-surface-raised p-6 sm:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.6)]">
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-sa9-text mb-2">
                Compose your <span className="text-sa9-cyan">signal</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mb-6">
                Straight to the bridge. No ticket queue, no bot in the middle.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              &larr; BACK TO HOME
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
