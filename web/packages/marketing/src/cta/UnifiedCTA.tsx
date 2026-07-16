"use client";

import { getCTA, type CTAAction } from "./cta-config";

interface UnifiedCTAProps {
  product: string;
  className?: string;
  showSecondary?: boolean;
  overrideLabel?: string;
  onClick?: (action: CTAAction) => void;
}

/**
 * Unified CTA component that renders the correct call-to-action
 * based on product configuration. Design-system-agnostic — styled
 * via className and CSS variables.
 */
export function UnifiedCTA({
  product,
  className = "",
  showSecondary = true,
  overrideLabel,
  onClick,
}: UnifiedCTAProps) {
  const cta = getCTA(product);
  if (!cta) return null;

  const handleClick = (action: CTAAction) => {
    onClick?.(action);
  };

  const primary = cta.waitlist ?? cta.primary;

  return (
    <div className={`sa9-cta flex items-center gap-4 ${className}`}>
      <a
        href={primary.href}
        onClick={() => handleClick(primary)}
        className="sa9-cta-primary inline-flex items-center justify-center px-6 py-3 font-semibold rounded-sm transition-all"
      >
        {overrideLabel ?? primary.label}
      </a>
      {showSecondary && cta.secondary && (
        <a
          href={cta.secondary.href}
          onClick={() => handleClick(cta.secondary!)}
          className="sa9-cta-secondary inline-flex items-center justify-center px-6 py-3 font-semibold rounded-sm transition-all"
        >
          {cta.secondary.label}
        </a>
      )}
    </div>
  );
}
