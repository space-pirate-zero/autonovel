"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

/**
 * Section wrapper with a gentle one-time entrance animation.
 *
 * Content is ALWAYS visible (no JS/opacity gate). The `animate-fade-in-up`
 * class provides a CSS-only entrance and degrades to fully-visible when
 * animations are disabled — so a missed IntersectionObserver callback or a
 * failed hydration can never leave a section blank.
 */
export function AnimatedSection({ children, className, id }: AnimatedSectionProps) {
  return (
    <section id={id} className={cn("animate-fade-in-up", className)}>
      {children}
    </section>
  );
}
