"use client";

import { STORE_OPEN } from "@/lib/storefront";
import type { ReactNode } from "react";

interface StorefrontGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders `children` when the store is open (`NEXT_PUBLIC_STORE_OPEN=true`).
 * Otherwise shows a "Coming Soon" banner with a subscribe CTA.
 */
export function StorefrontGate({ children, fallback }: StorefrontGateProps) {
  if (STORE_OPEN) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-cyan-500/30 bg-surface-900/50 p-8 text-center">
      <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
        Coming Soon
      </span>
      <p className="max-w-md text-surface-300">
        Products are launching soon. Subscribe to get notified.
      </p>
      <a
        href="https://spacepiratezero.substack.com"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-2"
      >
        Subscribe for Launch Updates
      </a>
    </div>
  );
}

/**
 * Inline price display — shows price when store is open, "Coming Soon" when closed.
 */
export function StorefrontPrice({
  price,
  period,
  className = "",
}: {
  price: string;
  period?: string;
  className?: string;
}) {
  if (!STORE_OPEN) {
    return (
      <span className={`text-cyan-400 font-semibold ${className}`}>
        Coming Soon
      </span>
    );
  }

  return (
    <span className={className}>
      {price}
      {period && <span className="text-sm text-surface-400">{period}</span>}
    </span>
  );
}
