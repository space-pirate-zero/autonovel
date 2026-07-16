import type { ReactNode } from "react";

interface HeroSectionProps {
  headline: string;
  subheadline?: string;
  children?: ReactNode;
  className?: string;
  badge?: string;
}

/**
 * Configurable hero section for marketing pages.
 * Pass CTA buttons, images, or other content as children.
 */
export function HeroSection({
  headline,
  subheadline,
  children,
  className = "",
  badge,
}: HeroSectionProps) {
  return (
    <section className={`sa9-hero relative py-24 px-6 text-center ${className}`}>
      <div className="mx-auto max-w-4xl">
        {badge && (
          <span className="sa9-hero-badge inline-block mb-6 px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-sm">
            {badge}
          </span>
        )}
        <h1 className="sa9-hero-headline text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          {headline}
        </h1>
        {subheadline && (
          <p className="sa9-hero-subheadline mt-6 text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}
        {children && <div className="sa9-hero-actions mt-10">{children}</div>}
      </div>
    </section>
  );
}
