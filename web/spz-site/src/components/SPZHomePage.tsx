"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BaseContent, ArticleContent, MusicContent } from "@/types/content";
import { BatmanSpiral } from "./BatmanSpiral";
import { transmissions, streamingNow, type Accent } from "@/lib/transmissions";
import { Carousel } from "@/components/ui/Carousel";
import type { LiveDispatch } from "@/lib/substack-live";

type SignupStatus = "idle" | "submitting" | "success" | "error";

// Full static literals so Tailwind's source scanner emits them.
const accentText: Record<Accent, string> = {
  pink: "text-sa9-pink",
  cyan: "text-sa9-cyan",
  green: "text-sa9-green",
  purple: "text-sa9-purple",
  orange: "text-sa9-orange",
  yellow: "text-sa9-yellow",
};
const accentBorderHover: Record<Accent, string> = {
  pink: "hover:border-sa9-pink",
  cyan: "hover:border-sa9-cyan",
  green: "hover:border-sa9-green",
  purple: "hover:border-sa9-purple",
  orange: "hover:border-sa9-orange",
  yellow: "hover:border-sa9-yellow",
};
const accentBorder: Record<Accent, string> = {
  pink: "border-sa9-pink",
  cyan: "border-sa9-cyan",
  green: "border-sa9-green",
  purple: "border-sa9-purple",
  orange: "border-sa9-orange",
  yellow: "border-sa9-yellow",
};

const transmissionStatusLabel: Record<string, string> = {
  streaming: "● NOW STREAMING",
  available: "● AVAILABLE",
  produced: "● PRODUCED",
  "in-production": "○ IN PRODUCTION",
};

function SignupForm({
  type = "newsletter",
  variant = "inline",
}: {
  type?: "newsletter" | "beta" | "waitlist";
  variant?: "inline" | "stacked";
}) {
  const [status, setStatus] = useState<SignupStatus>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 py-3">
        <span className="font-mono text-sm text-sa9-cyan tracking-wide">
          SIGNAL_LOCKED. You&apos;re on the list.
        </span>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <form onSubmit={handleSubmit} className="max-w-md space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          className="w-full bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-cyan focus:outline-none transition-colors placeholder:text-sa9-text-dim"
        />
        <Button
          type="submit"
          variant="cyan"
          size="lg"
          disabled={status === "submitting"}
          className="w-full"
        >
          {status === "submitting"
            ? "TRANSMITTING..."
            : type === "beta"
              ? "JOIN_BETA"
              : type === "waitlist"
                ? "JOIN_WAITLIST"
                : "GET_DISPATCHES"}
        </Button>
        {status === "error" && (
          <p className="text-sa9-pink text-xs font-mono">
            Transmission failed. Try again.
          </p>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-lg"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-cyan focus:outline-none transition-colors placeholder:text-sa9-text-dim"
      />
      <Button
        type="submit"
        variant="cyan"
        size="lg"
        disabled={status === "submitting"}
      >
        {status === "submitting"
          ? "..."
          : type === "beta"
            ? "JOIN_BETA"
            : type === "waitlist"
              ? "JOIN_WAITLIST"
              : "GET_DISPATCHES"}
      </Button>
      {status === "error" && (
        <span className="text-sa9-pink text-xs font-mono self-center">
          Failed. Try again.
        </span>
      )}
    </form>
  );
}

function AnimatedSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  // Content is ALWAYS visible; the entrance is a CSS-only animation that
  // degrades to fully-visible. A missed IntersectionObserver callback or a
  // failed hydration can never leave a section blank.
  return (
    <section id={id} className={`animate-fade-in-up ${className || ""}`}>
      {children}
    </section>
  );
}

function Badge({
  variant = "pink",
  className,
  children,
}: {
  variant?: "pink" | "cyan" | "acid" | "orange";
  className?: string;
  children: ReactNode;
}) {
  const styles = {
    pink: "bg-sa9-pink/20 text-sa9-pink border-sa9-pink",
    cyan: "bg-sa9-cyan/20 text-sa9-cyan border-sa9-cyan",
    acid: "bg-sa9-acid/20 text-sa9-acid border-sa9-acid",
    orange: "bg-sa9-orange/20 text-sa9-orange border-sa9-orange",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-widest border-2 ${styles[variant]} ${className || ""}`}
    >
      {children}
    </span>
  );
}

function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  variant?: "primary" | "secondary" | "ghost" | "cyan";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantStyles = {
    primary:
      "bg-sa9-pink text-sa9-surface border-sa9-pink hover:bg-sa9-magenta hover:border-sa9-magenta shadow-[var(--shadow-pink)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    secondary:
      "bg-sa9-surface-raised text-sa9-text border-sa9-border hover:border-sa9-pink hover:text-sa9-pink shadow-[var(--shadow-md)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    ghost:
      "bg-transparent text-sa9-text-muted border-transparent hover:text-sa9-pink hover:border-sa9-pink",
    cyan: "bg-sa9-cyan text-sa9-surface border-sa9-cyan shadow-[var(--shadow-cyan)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  };
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-display font-bold uppercase tracking-wider border-3 transition-all duration-150 cursor-pointer select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SPZHomePage({
  content,
  liveDispatches = [],
}: {
  content: BaseContent[];
  liveDispatches?: LiveDispatch[];
}) {
  const byDate = (a: BaseContent, b: BaseContent) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  const articles = (content
    .filter((c) => c.type === "Article" && (c.subtype === "article" || !c.subtype)) as ArticleContent[])
    .sort(byDate)
    .slice(0, 6);
  const music = content.filter((c) => c.type === "Music") as MusicContent[];
  const press = (content
    .filter(
      (c) =>
        c.type === "Article" &&
        (c.subtype === "press" || c.subtype === "video_press" || c.subtype === "video-press" || c.subtype === "video press")
    ) as ArticleContent[])
    .sort(byDate)
    .slice(0, 6);
  const brands = content.filter((c) => c.type === "Brand");
  const books = content.filter((c) => c.type === "Book");

  return (
    <>
      {/* ══ BATMAN SPIRAL INTRO ══ */}
      <BatmanSpiral />

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b-3 border-sa9-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sa9-cyan/5 via-transparent to-sa9-pink/5" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-2/3 h-full opacity-[0.07] hidden lg:block">
            <div className="grid grid-cols-12 grid-rows-[repeat(16,1fr)] gap-px h-full">
              {Array.from({ length: 192 }).map((_, i) => {
                const isPink = i % 11 === 0;
                const isCyan = i % 17 === 0;
                const isActive = i % 3 === 0 || i % 7 === 0;
                return (
                  <div
                    key={i}
                    className={`border ${isPink ? "border-sa9-pink bg-sa9-pink/20" : isCyan ? "border-sa9-cyan bg-sa9-cyan/20" : isActive ? "border-sa9-cyan/40" : "border-sa9-cyan/10"}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="cyan">CAPTAIN&apos;S_LOG</Badge>
                <Badge variant="pink">DIGITAL_INSURGENT</Badge>
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-none mb-6 animate-text-reveal">
                <span className="text-sa9-cyan animate-neon-pulse">SPACE</span>
                <br />
                <span className="text-sa9-pink">PIRATE ZERO</span>
              </h1>

              <p className="text-sa9-text-muted text-lg sm:text-xl max-w-xl mb-4 leading-relaxed font-body">
                Enterprise AI strategist turned indie builder. Investigative writer.
                Multi-patent inventor. Music producer. Captain of Spaceship Alpha 9.
              </p>
              <p className="text-sa9-cyan font-mono text-sm mb-8">
                {"// no algorithms. no noise. just shipping."}
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#writing">
                  <Button variant="primary" size="lg">
                    READ_DISPATCHES
                  </Button>
                </a>
                <a href="#music">
                  <Button variant="cyan" size="lg">
                    HEAR_THE_SIGNAL
                  </Button>
                </a>
              </div>

              <div className="mt-8 pt-6 border-t-3 border-sa9-border/30">
                <p className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-3">
                  Join the waitlist — beta invites & dispatches
                </p>
                <SignupForm type="waitlist" />
              </div>
            </div>

            <div className="flex-shrink-0 relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[480px] lg:h-[480px]">
              {/* Captain face with glitch-on-hover */}
              <div className="absolute inset-0 group cursor-pointer">
                <div
                  data-hero-face
                  className="captain-circle relative w-full h-full overflow-hidden border-[6px] border-sa9-cyan animate-float hover:animate-glitch"
                  style={{
                    boxShadow: "0 0 40px rgba(0,240,255,0.3), 0 0 80px rgba(0,240,255,0.15)",
                    background: "var(--sa9-surface)",
                  }}
                >
                  <Image
                    src="/face-ball.png"
                    alt="Space Pirate Zero — The Captain"
                    fill
                    className="object-cover object-[center_15%] group-hover:scale-110 transition-transform duration-300"
                    priority
                    sizes="(max-width: 640px) 288px, (max-width: 1024px) 384px, 480px"
                  />
                </div>
              </div>
              {/* SA9 product icons orbiting the face */}
              {[
                { icon: "🏴‍☠️", delay: 0 },
                { icon: "👗", delay: 1 },
                { icon: "👻", delay: 2 },
                { icon: "🥷", delay: 3 },
                { icon: "🪙", delay: 4 },
                { icon: "🌊", delay: 5 },
                { icon: "🔲", delay: 6 },
                { icon: "🎵", delay: 7 },
                { icon: "🎬", delay: 8 },
                { icon: "📀", delay: 9 },
                { icon: "🎰", delay: 10 },
                { icon: "🏠", delay: 11 },
                { icon: "🧩", delay: 12 },
                { icon: "✂️", delay: 13 },
                { icon: "🛡️", delay: 14 },
                { icon: "📺", delay: 15 },
              ].map(({ icon, delay }) => (
                <div
                  key={delay}
                  className="absolute inset-[-15%] animate-spin-orbit pointer-events-none"
                  style={{
                    animationDuration: "30s",
                    animationDelay: `${-(delay * 30) / 16}s`,
                  }}
                >
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl drop-shadow-[0_0_8px_rgba(255,20,147,0.5)] animate-spin-orbit-reverse"
                    style={{ animationDuration: "30s", animationDelay: `${-(delay * 30) / 16}s` }}
                  >
                    {icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section className="border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x-3 divide-sa9-border">
            {[
              { value: String(music.length), label: "Albums" },
              { value: String(streamingNow.length), label: "Live Series" },
              { value: "2", label: "Patents" },
              { value: "6", label: "SA9 Products" },
              { value: "100%", label: "Independent" },
            ].map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center">
                <div className="font-display font-black text-3xl text-sa9-cyan">
                  {stat.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WRITING / DISPATCHES ══ */}
      <AnimatedSection id="writing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge variant="pink" className="mb-3">
                SUBSTACK_DISPATCHES
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text">
                Investigative AI Writing.
                <br />
                <span className="text-sa9-pink">From the Outer Edge.</span>
              </h2>
              <p className="text-sa9-text-muted text-sm mt-3 max-w-lg">
                Dispatches on AI, enterprise insurgency, cybersecurity, and the
                future of work. No algorithms. No noise.
              </p>
            </div>
            <div className="hidden sm:flex gap-3">
              <a
                href="https://spacepiratezero.substack.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm">
                  SUBSCRIBE ON SUBSTACK
                </Button>
              </a>
              <Link href="/content/article">
                <Button variant="ghost" size="sm">
                  All Dispatches &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {liveDispatches.length > 0 ? (
            <Carousel ariaLabel="Latest Substack dispatches">
              {liveDispatches.map((d) => (
                <a
                  key={d.guid}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-3 border-sa9-border bg-sa9-surface-raised shadow-[var(--shadow-md)] hover:border-sa9-pink hover:shadow-[var(--shadow-pink)] transition-all duration-150 group flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden border-b-3 border-sa9-border">
                    <Image
                      src={d.image}
                      alt={d.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 80vw, 32vw"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-cyan mb-2">
                      {d.date}
                    </div>
                    <h3 className="font-display font-bold text-base uppercase tracking-wider text-sa9-text group-hover:text-sa9-pink transition-colors mb-2 line-clamp-2">
                      {d.title}
                    </h3>
                    <p className="text-sa9-text-muted text-sm line-clamp-2">
                      {d.summary}
                    </p>
                  </div>
                </a>
              ))}
            </Carousel>
          ) : (
            <Carousel ariaLabel="Dispatches">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/content/article/${article.slug}`}
                  className="border-3 border-sa9-border bg-sa9-surface-raised shadow-[var(--shadow-md)] hover:border-sa9-pink hover:shadow-[var(--shadow-pink)] transition-all duration-150 group flex flex-col h-full"
                >
                  <div className="relative h-48 overflow-hidden border-b-3 border-sa9-border">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 80vw, 32vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-base uppercase tracking-wider text-sa9-text group-hover:text-sa9-pink transition-colors mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sa9-text-muted text-sm line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                </Link>
              ))}
            </Carousel>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/content/article">
              <Button variant="secondary" size="md">
                ALL_DISPATCHES &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ MUSIC ══ */}
      <AnimatedSection
        id="music"
        className="border-y-3 border-sa9-border bg-sa9-surface-raised py-20 sm:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="cyan" className="mb-3">
            SIGNAL_BROADCAST
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4">
            Music From the{" "}
            <span className="text-sa9-cyan">Outer Edge.</span>
          </h2>
          <p className="text-sa9-text-muted text-lg mb-12 max-w-2xl">
            {music.length} albums. Hip-hop, Latin, alternative, lo-fi cosmic beats.
            Transmissions from the space between empires.
          </p>

          <Carousel ariaLabel="Albums by Space Pirate Zero">
            {music.map((album) => (
              <Link
                key={album.id}
                href={`/content/music/${album.slug}`}
                className="border-3 border-sa9-border bg-sa9-surface shadow-[var(--shadow-md)] hover:border-sa9-cyan hover:shadow-[var(--shadow-cyan)] transition-all duration-150 flex flex-col h-full"
              >
                <div className="relative aspect-square overflow-hidden border-b-3 border-sa9-border">
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-base uppercase tracking-wider text-sa9-text mb-1">
                    {album.title}
                  </h3>
                  <p className="font-mono text-xs text-sa9-text-muted mb-3">
                    {(album as MusicContent).tracks?.length || 0} tracks
                  </p>
                  <p className="text-sa9-text-muted text-sm line-clamp-2 mb-4">
                    {album.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(album as MusicContent).spotifyLink && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open((album as MusicContent).spotifyLink, '_blank', 'noopener,noreferrer'); }}
                        className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border-2 border-sa9-acid text-sa9-acid hover:bg-sa9-acid hover:text-sa9-surface transition-all cursor-pointer"
                      >
                        Spotify
                      </button>
                    )}
                    {(album as MusicContent).appleMusicLink && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open((album as MusicContent).appleMusicLink, '_blank', 'noopener,noreferrer'); }}
                        className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border-2 border-sa9-pink text-sa9-pink hover:bg-sa9-pink hover:text-sa9-surface transition-all cursor-pointer"
                      >
                        Apple Music
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </AnimatedSection>

      {/* ══ DOSSIER ══ */}
      <AnimatedSection id="dossier" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <Badge variant="cyan" className="mb-3">
                PERSONNEL_FILE
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-6">
                Greg Chambers.{" "}
                <span className="text-sa9-cyan">Digital Insurgent at Large.</span>
              </h2>
              <div className="space-y-4 text-sa9-text-muted text-lg leading-relaxed max-w-2xl">
                <p>
                  Enterprise AI strategist turned indie builder. Former Coca-Cola
                  Director of Innovation. Guinness World Record holder.
                  Multi-patent inventor. Now building 6 products from a home
                  office in Atlanta, powered by the conviction that intelligence
                  should be embedded in the product, not bolted on after the fact.
                </p>
                <p>
                  The kind of person who deploys on Fridays, writes investigative AI
                  dispatches on Substack, and believes friction creates meaning.
                  Also drops cosmic lo-fi beats on Apple Music.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="https://spaceshipalpha9.co"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="cyan" size="sm">
                    VIEW_SA9_FLEET
                  </Button>
                </a>
                <a
                  href="https://spacepiratezero.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    SUBSTACK_FEED
                  </Button>
                </a>
                <a
                  href="https://www.linkedin.com/in/gregchambers/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    LINKEDIN
                  </Button>
                </a>
              </div>
            </div>

            {/* Career Highlights */}
            <div className="w-full md:w-96 space-y-4">
              {[
                {
                  label: "Coca-Cola",
                  role: "Global Director, Digital Innovation",
                  period: "2013-2018",
                  color: "border-sa9-pink",
                },
                {
                  label: "Spaceship Alpha 9",
                  role: "Founder / Captain",
                  period: "2018-Present",
                  color: "border-sa9-cyan",
                },
                {
                  label: "Enterprise Cloud",
                  role: "Apple Silicon AI Clusters",
                  period: "2024-2025",
                  color: "border-sa9-acid",
                },
                {
                  label: "Theragun",
                  role: "Intelligence Engine Architect",
                  period: "2019-2020",
                  color: "border-sa9-orange",
                },
              ].map((role) => (
                <div
                  key={role.label}
                  className={`border-3 ${role.color} bg-sa9-surface-raised p-4 shadow-[var(--shadow-sm)]`}
                >
                  <div className="font-display font-bold text-sm uppercase tracking-widest text-sa9-text">
                    {role.label}
                  </div>
                  <div className="font-mono text-xs text-sa9-text-muted mt-1">
                    {role.role}
                  </div>
                  <div className="font-mono text-[10px] text-sa9-text-dim mt-0.5">
                    {role.period}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ TRANSMISSIONS — the library + live series ══ */}
      <AnimatedSection
        id="transmissions"
        className="border-y-3 border-sa9-border bg-sa9-surface-raised py-20 sm:py-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="cyan" className="mb-3">
            THE_TRANSMISSIONS
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-3">
            The Library.{" "}
            <span className="text-sa9-cyan">Signal, Serialized.</span>
          </h2>
          <p className="text-sa9-text-muted text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            Books, audio drama, and a field course — every release a transmission
            from Spaceship Alpha 9. A full-cast series is streaming now — more coming soon.
          </p>

          {/* Now streaming — two live series, large */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {streamingNow.map((t) => (
              <div
                key={t.id}
                className={`border-3 border-sa9-border bg-sa9-surface p-6 shadow-[var(--shadow-md)] flex flex-col sm:flex-row gap-5 ${accentBorderHover[t.accent]} transition-colors`}
              >
                <div className="relative w-full sm:w-52 aspect-square flex-shrink-0 border-3 border-sa9-border overflow-hidden bg-sa9-surface">
                  {t.trailer ? (
                    <video
                      src={t.trailer}
                      poster={t.cover}
                      controls
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    t.cover && (
                      <Image
                        src={t.cover}
                        alt={`${t.title} cover`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 208px"
                      />
                    )
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className={`font-mono text-[10px] uppercase tracking-widest mb-2 ${accentText[t.accent]}`}>
                    {transmissionStatusLabel[t.status]} · {t.episodes} EP
                  </div>
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-sa9-text leading-tight mb-2">
                    {t.title}
                  </h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed flex-1 line-clamp-4">
                    {t.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {t.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-mono text-[11px] uppercase tracking-wide border-3 border-sa9-border px-2.5 py-1 text-sa9-text ${accentBorderHover[t.accent]} transition-colors`}
                      >
                        {l.label} →
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* The rest of the slate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {transmissions
              .filter((t) => t.status !== "streaming")
              .map((t) => (
                <article
                  key={t.id}
                  className={`group relative border-3 border-sa9-border bg-sa9-surface ${accentBorderHover[t.accent]} transition-all duration-150 shadow-[var(--shadow-md)] flex flex-col`}
                >
                  {t.comingSoon ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      <span
                        className={`font-display font-black uppercase tracking-[0.25em] text-sm px-4 py-2 border-3 ${accentBorder[t.accent]} ${accentText[t.accent]} bg-sa9-surface/85`}
                      >
                        Coming Soon
                      </span>
                    </div>
                  ) : null}
                  <div
                    className={`flex flex-col flex-1 ${t.comingSoon ? "transition-[filter] duration-300 group-hover:blur-[5px]" : ""}`}
                  >
                    <div className="relative w-full aspect-square overflow-hidden border-b-3 border-sa9-border">
                      {t.cover && (
                        <Image
                          src={t.cover}
                          alt={`${t.title} cover`}
                          fill
                          className={`object-cover group-hover:scale-[1.03] transition-transform duration-300 ${t.comingSoon ? "opacity-70" : ""}`}
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      )}
                      <div className={`absolute top-0 left-0 font-mono text-[10px] uppercase tracking-widest bg-sa9-surface/90 px-2 py-1 border-r-3 border-b-3 border-sa9-border ${accentText[t.accent]}`}>
                        {t.comingSoon ? "○ COMING SOON" : transmissionStatusLabel[t.status]}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim mb-2">
                        {t.genre}
                      </div>
                      <h3 className="font-display font-black text-base uppercase tracking-tight text-sa9-text leading-tight mb-2">
                        {t.title}
                      </h3>
                      <p
                        className={`text-sa9-text-muted text-sm leading-relaxed flex-1 line-clamp-3 ${t.comingSoon ? "blur-[3px] select-none" : ""}`}
                      >
                        {t.logline}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ PRESS ══ */}
      <AnimatedSection id="press" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="pink" className="mb-3">
            PRESS_INTERCEPTS
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-12">
            In The News.{" "}
            <span className="text-sa9-pink">Not By Choice.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {press.map((item) => (
              <a
                key={item.id}
                href={(item as ArticleContent).substackUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="border-3 border-sa9-border bg-sa9-surface-raised p-5 shadow-[var(--shadow-sm)] hover:border-sa9-pink hover:shadow-[var(--shadow-pink)] transition-all duration-150 group"
              >
                <div className="flex gap-2 mb-3 flex-wrap">
                  {item.topicTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono uppercase tracking-widest text-sa9-pink border border-sa9-pink/30 px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-sa9-text group-hover:text-sa9-pink transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-sa9-text-muted text-sm line-clamp-2">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ SA9 ECOSYSTEM TEASER ══ */}
      <AnimatedSection className="border-y-3 border-sa9-pink bg-sa9-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="cyan" className="mb-6">
              OPEN_TRANSMISSION
            </Badge>
            <blockquote className="font-display font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-sa9-text leading-tight mb-8">
              &ldquo;We didn&apos;t build a tool.
              <br />
              We built a{" "}
              <span className="text-sa9-pink animate-neon-pulse">
                consciousness
              </span>
              .&rdquo;
            </blockquote>
            <p className="text-sa9-text-muted text-lg mb-8">
              No venture capital. No permission. No compromise. 6 products
              shipping from one studio. Intelligence embedded, not decorated.
              The Tiffany lamp, not the fluorescent tube.
            </p>
            <a
              href="https://spaceshipalpha9.co/manifesto"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cyan" size="lg">
                READ_SA9_MANIFESTO
              </Button>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* ══ FAQ ══ */}
      <AnimatedSection id="faq" className="border-y-3 border-sa9-border py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-10">
            <div className="w-1 h-12 bg-sa9-cyan flex-shrink-0 mt-1" />
            <div>
              <Badge variant="cyan" className="mb-3">
                TRANSMISSION_LOG
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text">
                Questions You&apos;d Actually{" "}
                <span className="text-sa9-cyan">Ask.</span>
              </h2>
            </div>
          </div>
          <div className="max-w-3xl space-y-3">
            {[
              {
                q: "Who is Space Pirate Zero?",
                a: "Greg Chambers. Enterprise AI strategist turned indie builder. Former Coca-Cola Director of Innovation. Guinness World Record holder. Multi-patent inventor. Captain of Spaceship Alpha 9. Investigative writer on AI, enterprise dysfunction, and cybersecurity. Also makes music that sounds like cosmic lo-fi had a baby with a satellite collision.",
              },
              {
                q: "What is Spaceship Alpha 9?",
                a: "An AI-native indie software studio shipping 6 products out of one home office in Atlanta. Consumer apps, developer tools, AI platforms, games, and infrastructure. No VC. No board. No permission required. Intelligence embedded in every product, not bolted on after the fact.",
              },
              {
                q: "What do you write about on Substack?",
                a: "Real investigations. Enterprise AI failures. Dark web ecosystems. Cybersecurity theater. What digital transformation actually looks like versus what it gets sold as. Not content marketing. Not thought leadership. Just the actual situation, written like it matters.",
              },
              {
                q: "Where can I stream the music?",
                a: "Everywhere. Spotify, Apple Music, YouTube. Six albums of cosmic lo-fi — hip-hop, Latin, alternative, synth-pop — plus 'Signal Finds Signal,' the 24-track industrial-goth companion to the Neko Death Cult audio drama. 'Lambada on Saturn's Rings' is the debut. Start there.",
              },
              {
                q: "Can I work with you / hire you / partner with you?",
                a: "Depends what you mean. If you need an enterprise AI strategist, investigative writer, or product architect — reach out via spaceshipalpha9.co/contact. If you want to invest, acquire, or strategically partner, the answer is no. If you want to use the products, that's what they're there for.",
              },
              {
                q: "Why does this website look like a cyberpunk anime?",
                a: "Because software has looked like PowerPoint for too long. The cel-shading is intentional. The neon is load-bearing. The chunky borders are a design decision. The Tiffany lamp, not the fluorescent tube. If your product doesn't make someone feel something, you built a spreadsheet with a login page.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group border-3 border-sa9-border bg-sa9-surface-raised shadow-[var(--shadow-md)] open:border-sa9-cyan open:shadow-[var(--shadow-cyan)]"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none font-display font-bold text-sm uppercase tracking-wider text-sa9-text group-open:text-sa9-cyan transition-colors">
                  <span>{item.q}</span>
                  <span className="ml-4 flex-shrink-0 font-mono text-sa9-text-dim group-open:text-sa9-cyan text-xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5">
                  <div className="border-t-3 border-sa9-border pt-4">
                    <p className="text-sa9-text-muted text-sm leading-relaxed font-body">
                      {item.a}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="bg-sa9-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4">
            Ready to{" "}
            <span className="text-sa9-cyan animate-neon-pulse">board</span>?
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8">
            Beta invites, AI dispatches, and product drops.
            No algorithms. No noise.
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
                GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

