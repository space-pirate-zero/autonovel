"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";

const navLinks = [
  { href: "/products", label: "FLEET" },
  { href: "/studio", label: "STUDIO" },
  { href: "/music", label: "MUSIC" },
  { href: "/consulting", label: "ENTERPRISE" },
  { href: "/about", label: "DOSSIER" },
  { href: "/contact", label: "COMMS" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-sa9-surface/95 backdrop-blur-sm border-b-3 border-sa9-border">
      <div className="warning-stripes" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Spaceship Alpha 9 — home"
          >
            <div className="relative flex items-center justify-center w-11 h-11 border-3 border-sa9-border bg-sa9-surface group-hover:border-sa9-pink transition-colors group-hover:animate-flicker">
              <LogoMark className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-sm sm:text-base uppercase tracking-[0.22em] text-sa9-pink group-hover:animate-neon-pulse transition-all">
                SPACESHIP
              </span>
              <span className="font-display font-bold text-[10px] uppercase tracking-[0.42em] text-sa9-cyan">
                ALPHA&nbsp;9
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-sa9-text-muted hover:text-sa9-pink hover:bg-sa9-surface-raised border-3 border-transparent hover:border-sa9-pink transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Waitlist CTA */}
            <Link
              href="/waitlist"
              className="hidden sm:inline-flex px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-sa9-surface bg-sa9-pink border-3 border-sa9-pink shadow-[2px_2px_0_#990044] hover:bg-sa9-magenta hover:border-sa9-magenta transition-all duration-150"
            >
              JOIN_WAITLIST
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden px-2 py-2 font-mono text-sm text-sa9-text-muted hover:text-sa9-pink border-3 border-transparent hover:border-sa9-pink transition-all"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t-3 border-sa9-border bg-sa9-surface"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 font-mono text-sm uppercase tracking-wider text-sa9-text-muted hover:text-sa9-pink hover:bg-sa9-surface-raised border-3 border-transparent hover:border-sa9-pink transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/waitlist"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 font-mono text-sm uppercase tracking-wider text-sa9-pink"
            >
              JOIN_WAITLIST →
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
