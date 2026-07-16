"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "FEATURES", href: "#features" },
  { label: "STACK", href: "#stack" },
  { label: "PLATFORMS", href: "#platforms" },
] as const;

function getCtaLabel(status: Product["status"]): string {
  switch (status) {
    case "live":
      return "Launch App";
    case "beta":
      return "Join Beta";
    case "development":
    case "docs":
      return "Get Notified";
  }
}

export function CommercialHeader({ product }: { product: Product }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ctaLabel = getCtaLabel(product.status);

  return (
    <header
      className="sticky top-0 z-50 bg-sa9-surface/95 backdrop-blur-sm border-b-3 border-sa9-border"
      role="banner"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Product identity */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {product.icon}
            </span>
            <div className="flex flex-col">
              <span className="font-display font-bold uppercase text-sm tracking-wider text-sa9-text">
                {product.name}
              </span>
              <span className="font-mono text-xs text-sa9-text-dim">
                BY SA9
              </span>
            </div>
          </div>

          {/* Center: Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Product sections"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted hover:text-sa9-pink transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: CTA + mobile hamburger */}
          <div className="flex items-center gap-4">
            <a href="#waitlist" className="hidden sm:inline-flex">
              <Button variant="primary" size="sm">
                {ctaLabel}
              </Button>
            </a>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 border-3 border-sa9-border bg-sa9-surface-raised"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <span
                className={cn(
                  "block w-5 h-0.5 bg-sa9-text transition-all duration-200",
                  menuOpen && "translate-y-[3px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "block w-5 h-0.5 bg-sa9-text mt-1 transition-all duration-200",
                  menuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block w-5 h-0.5 bg-sa9-text mt-1 transition-all duration-200",
                  menuOpen && "-translate-y-[5px] -rotate-45"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down nav */}
      <div
        id="mobile-nav"
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t-3 border-sa9-border bg-sa9-surface",
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
        role="navigation"
        aria-label="Mobile product sections"
      >
        <div className="px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-widest text-sa9-text-muted hover:text-sa9-pink transition-colors duration-150"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#waitlist" className="sm:hidden w-full">
            <Button variant="primary" size="sm" className="w-full">
              {ctaLabel}
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
