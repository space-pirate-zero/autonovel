"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/content/article", label: "DISPATCHES" },
  { href: "/content/book", label: "BOOKS" },
  { href: "/content/music", label: "MUSIC" },
  { href: "/content/press", label: "PRESS" },
  { href: "/bio", label: "DOSSIER" },
  { href: "/contact", label: "COMMS" },
];

export function SPZHeader() {
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
            aria-label="Space Pirate Zero — home"
          >
            <span className="text-2xl" role="img" aria-label="pirate flag">
              🏴‍☠️
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-sm uppercase tracking-[0.2em] text-sa9-pink group-hover:animate-neon-pulse transition-all">
                SPACE PIRATE
              </span>
              <span className="font-display font-bold text-[10px] uppercase tracking-[0.3em] text-sa9-cyan">
                ZERO
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
                className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-sa9-text-muted hover:text-sa9-pink hover:bg-sa9-surface-raised border-3 border-transparent hover:border-sa9-pink transition-all duration-150"
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
