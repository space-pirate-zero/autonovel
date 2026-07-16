import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const STATUS_BADGE: Record<
  Product["status"],
  { label: string; variant: "pink" | "cyan" | "orange" | "default" }
> = {
  live: { label: "LIVE", variant: "pink" },
  beta: { label: "BETA", variant: "cyan" },
  development: { label: "IN DEVELOPMENT", variant: "orange" },
  docs: { label: "DOCUMENTATION", variant: "default" },
};

function getCtaLabel(status: Product["status"]): string {
  switch (status) {
    case "live":
      return "Launch App";
    case "beta":
      return "Join the Beta";
    case "development":
    case "docs":
      return "Get Notified";
  }
}

export function CommercialHero({ product }: { product: Product }) {
  const statusInfo = STATUS_BADGE[product.status];
  const ctaLabel = getCtaLabel(product.status);
  const color = product.color;
  const accent = product.accentColor;

  return (
    <section
      className="relative min-h-[92vh] overflow-hidden flex items-center"
      aria-labelledby="hero-heading"
    >
      {/* ── Background: grid + themed orbs + scanlines ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 data-grid-bg opacity-60" />
        <div
          className="absolute top-[12%] -left-24 w-[28rem] h-[28rem] rounded-full blur-[130px] opacity-25 animate-neon-pulse"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute bottom-[8%] right-[6%] w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-20 animate-neon-pulse"
          style={{ backgroundColor: accent, animationDelay: "1.2s" }}
        />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)]" />
        {/* top hairline sweep */}
        <div
          className="absolute top-0 left-0 h-px w-full opacity-40"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        {/* ── Left: copy ── */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-in-up stagger-1">
            <Badge variant={statusInfo.variant}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-neon-pulse"
                  style={{ backgroundColor: color }}
                />
                {statusInfo.label}
              </span>
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-sa9-text-dim">
              {product.designSystem} design system
            </span>
          </div>

          <h1
            id="hero-heading"
            className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-sa9-text leading-[0.85] mb-5 break-words animate-fade-in-up stagger-2"
            style={{ textShadow: `0 0 42px ${color}44` }}
          >
            {product.name}
          </h1>

          <p
            className="font-mono text-lg sm:text-xl mb-6 animate-fade-in-up stagger-3"
            style={{ color }}
          >
            {product.tagline}
          </p>

          <p className="text-sa9-text-muted text-base sm:text-lg leading-relaxed mb-9 animate-fade-in-up stagger-4">
            {product.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 animate-fade-in-up stagger-5">
            {product.buyUrl ? (
              <a href={product.buyUrl} target="_blank" rel="noopener noreferrer">
                <span className="shine-host inline-block">
                  <Button variant="primary" size="lg" data-cta={`${product.id}:hero-buy`}>
                    {product.buyLabel ?? "Buy Now"} →
                  </Button>
                </span>
              </a>
            ) : product.status === "live" && product.domain ? (
              <Link href={`https://${product.domain}`} target="_blank" rel="noopener noreferrer">
                <span className="shine-host inline-block">
                  <Button variant="primary" size="lg" data-cta={`${product.id}:hero-primary`}>
                    {ctaLabel} →
                  </Button>
                </span>
              </Link>
            ) : (
              <a href="#waitlist">
                <span className="shine-host inline-block">
                  <Button variant="primary" size="lg" data-cta={`${product.id}:hero-primary`}>
                    {ctaLabel} →
                  </Button>
                </span>
              </a>
            )}
            {product.buyUrl ? (
              <a href="#waitlist">
                <Button variant="secondary" size="lg" data-cta={`${product.id}:hero-notify`}>
                  {ctaLabel}
                </Button>
              </a>
            ) : (
              <Link href="https://spaceshipalpha9.co/products">
                <Button variant="secondary" size="lg" data-cta={`${product.id}:hero-fleet`}>
                  Explore the Fleet
                </Button>
              </Link>
            )}
          </div>

          {product.liveUrl || product.buyUrl ? (
            <a
              href={product.liveUrl ?? `https://${product.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              data-cta={`${product.id}:hero-site`}
              className="inline-flex items-center gap-2 font-mono text-sm mb-10 animate-fade-in-up stagger-5 hover:underline"
              style={{ color }}
            >
              Visit {product.domain} →
            </a>
          ) : (
            <div className="mb-6" />
          )}

          <div
            className="flex flex-wrap items-center gap-2 animate-fade-in-up stagger-6"
            role="list"
            aria-label="Available platforms"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim mr-1">
              Runs on
            </span>
            {product.platforms.map((platform) => (
              <span
                key={platform}
                role="listitem"
                className="font-mono text-xs uppercase tracking-wider text-sa9-text border-3 border-sa9-border px-3 py-1 bg-sa9-surface transition-all duration-200 hover:-translate-y-0.5"
                style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.5)" }}
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right: framed product visual with radar sweep ── */}
        <div className="relative animate-fade-in-up stagger-4">
          {/* radar sweep behind the frame */}
          <div
            className="absolute inset-0 -m-6 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="w-[115%] aspect-square rounded-full opacity-[0.18] animate-radar"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${color} 55deg, transparent 120deg)`,
              }}
            />
            <div
              className="absolute w-[70%] aspect-square rounded-full border"
              style={{ borderColor: `${color}33` }}
            />
            <div
              className="absolute w-[95%] aspect-square rounded-full border"
              style={{ borderColor: `${color}22` }}
            />
          </div>

          <div
            className="relative border-3 bg-sa9-surface shadow-[10px_10px_0_rgba(0,0,0,0.6)] animate-float"
            style={{ borderColor: color }}
          >
            {/* HUD title bar */}
            <div
              className="flex items-center justify-between px-4 py-2 border-b-3"
              style={{ borderColor: color }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sa9-pink" />
                <span className="w-2.5 h-2.5 rounded-full bg-sa9-cyan" />
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim">
                {product.domain}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color }}
              >
                ● LOCKED
              </span>
            </div>

            {/* Screenshot or emblem */}
            <div className="relative aspect-[4/3] overflow-hidden bg-sa9-surface">
              {product.screenshot ? (
                <Image
                  src={product.screenshot}
                  alt={`${product.name} interface`}
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 90vw, 520px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl" aria-hidden="true">
                    {product.icon}
                  </span>
                </div>
              )}
              {/* moving scan line */}
              <div
                className="absolute left-0 right-0 h-16 opacity-30 animate-float"
                style={{
                  background: `linear-gradient(180deg, transparent, ${color}55, transparent)`,
                  animationDuration: "5s",
                }}
              />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.06)_3px,rgba(0,0,0,0.06)_4px)] pointer-events-none" />
            </div>
          </div>

          {/* floating stat chip */}
          <div
            className="absolute -bottom-4 -left-3 sm:-left-6 border-3 bg-sa9-surface px-4 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.6)]"
            style={{ borderColor: accent }}
          >
            <span
              className="font-display font-black text-lg"
              style={{ color: accent }}
            >
              {product.highlights[0]}
            </span>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-sa9-text-dim animate-float"
        aria-hidden="true"
      >
        scroll ↓
      </div>
    </section>
  );
}
