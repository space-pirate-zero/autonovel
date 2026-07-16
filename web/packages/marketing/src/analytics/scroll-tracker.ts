"use client";

import { getPostHog } from "@sa9/analytics";

/**
 * Tracks scroll depth milestones and reports to PostHog.
 * Call once on mount in a layout or page component.
 */
export function initScrollTracker(thresholds = [25, 50, 75, 100]) {
  if (typeof window === "undefined") return;

  const reported = new Set<number>();

  function measure() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const pct = Math.round((window.scrollY / scrollHeight) * 100);

    for (const threshold of thresholds) {
      if (pct >= threshold && !reported.has(threshold)) {
        reported.add(threshold);
        // Resolve the initialized PostHog instance from @sa9/analytics rather
        // than a global — the analytics package never assigns window.__posthog.
        const posthog = getPostHog();
        if (posthog && posthog.__loaded) {
          posthog.capture("content.scrollDepth", {
            depth_pct: threshold,
            page: window.location.pathname,
          });
        }
      }
    }
  }

  // Throttle to one measurement per animation frame — the scroll event can
  // fire dozens of times per second, and coalescing avoids redundant work.
  let ticking = false;
  function checkScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      measure();
    });
  }

  window.addEventListener("scroll", checkScroll, { passive: true });
  return () => window.removeEventListener("scroll", checkScroll);
}
