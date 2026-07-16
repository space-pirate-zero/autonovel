/**
 * Core Web Vitals reporting to PostHog.
 * Captures CLS, LCP, TTFB, INP, and FCP metrics as PostHog events.
 *
 * Usage in a Next.js layout or client component:
 *   import { reportWebVitals } from "@sa9/marketing/seo";
 *   reportWebVitals();
 *
 * `web-vitals` is an optional peer dependency — consumer sites install it
 * themselves. We do not import its types directly so the shared package
 * type-checks in isolation.
 */

import { getPostHog as getAnalyticsPostHog } from "@sa9/analytics";

type MetricName = "CLS" | "LCP" | "TTFB" | "INP" | "FCP";

interface RawVitalMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

interface WebVitalsModule {
  onCLS: (cb: (m: RawVitalMetric) => void) => void;
  onLCP: (cb: (m: RawVitalMetric) => void) => void;
  onTTFB: (cb: (m: RawVitalMetric) => void) => void;
  onINP: (cb: (m: RawVitalMetric) => void) => void;
  onFCP: (cb: (m: RawVitalMetric) => void) => void;
}

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

/** Threshold ratings per Google's Core Web Vitals guidelines */
const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
};

function getRating(name: MetricName, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value >= threshold.poor) return "poor";
  return "needs-improvement";
}

interface PostHogCapture {
  capture: (event: string, properties: Record<string, unknown>) => void;
}

/**
 * Locate an initialized PostHog instance. Prefer the one @sa9/analytics
 * initialized as an npm module (posthog-js init does NOT set window.posthog),
 * which is how every SA9 marketing site loads it — mirroring the scroll-tracker
 * fix. Fall back to window.posthog only for sites that load PostHog via the
 * legacy HTML snippet. Without the analytics-first lookup, every Core Web
 * Vitals metric was silently dropped on the npm-module sites.
 */
function getPostHog(): PostHogCapture | undefined {
  const fromModule = getAnalyticsPostHog();
  if (fromModule && typeof (fromModule as unknown as PostHogCapture).capture === "function") {
    return fromModule as unknown as PostHogCapture;
  }
  if (typeof window === "undefined") return undefined;
  const candidate = (window as unknown as { posthog?: unknown }).posthog;
  if (candidate && typeof (candidate as PostHogCapture).capture === "function") {
    return candidate as PostHogCapture;
  }
  return undefined;
}

function sendToPostHog(metric: WebVitalMetric): void {
  const posthog = getPostHog();
  if (!posthog) return;
  posthog.capture("$web_vitals", {
    $web_vitals_metric_name: metric.name,
    $web_vitals_metric_value: metric.value,
    $web_vitals_metric_rating: metric.rating,
    $web_vitals_metric_delta: metric.delta,
    $web_vitals_metric_id: metric.id,
    $web_vitals_navigation_type: metric.navigationType,
    $current_url: typeof window !== "undefined" ? window.location.href : "",
  });
}

/**
 * Initialize Core Web Vitals reporting.
 * Dynamically imports the web-vitals library and reports each metric to PostHog.
 * Call once in your root layout or app entry point (client-side only).
 *
 * `web-vitals` is an optional peer — if the consumer hasn't installed it,
 * the dynamic import fails silently.
 */
export function reportWebVitals(): void {
  if (typeof window === "undefined") return;

  // Wrap the specifier through a local variable so TypeScript doesn't try
  // to resolve `web-vitals` at compile time. The consumer site that imports
  // this helper is responsible for installing the real `web-vitals` package.
  const specifier = "web-vitals";
  (import(/* webpackIgnore: true */ specifier) as Promise<WebVitalsModule>)
    .then(({ onCLS, onLCP, onTTFB, onINP, onFCP }) => {
      const handler = (rawMetric: RawVitalMetric) => {
        const name = rawMetric.name as MetricName;
        sendToPostHog({
          name,
          value: rawMetric.value,
          rating: getRating(name, rawMetric.value),
          delta: rawMetric.delta,
          id: rawMetric.id,
          navigationType: rawMetric.navigationType,
        });
      };
      onCLS(handler);
      onLCP(handler);
      onTTFB(handler);
      onINP(handler);
      onFCP(handler);
    })
    .catch(() => {
      // web-vitals not available — silently degrade.
    });
}
