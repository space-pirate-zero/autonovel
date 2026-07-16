import { getPostHog } from "./posthog";

function capture(event: string, properties?: Record<string, unknown>) {
  const ph = getPostHog();
  if (!ph?.__loaded) return;
  ph.capture(event, properties);
}

// ─── Marketing Funnel ──────────────────────────────────────────────

export const marketing = {
  /** Waitlist signup from any product site */
  waitlistJoined: (source: string, product?: string) =>
    capture("waitlist_joined", { source, product }),

  /** Contact form submitted */
  contactSubmitted: (optIn: boolean) =>
    capture("contact_form_submitted", { opt_in: optIn }),

  /** Newsletter / mailing list subscription */
  newsletterSubscribed: (source: string) =>
    capture("newsletter_subscribed", { source }),

  /** CTA button clicked (e.g. "Get Started", "Join Waitlist") */
  ctaClicked: (cta: string, location: string) =>
    capture("cta_clicked", { cta_label: cta, location }),

  /** Pricing section viewed */
  pricingViewed: () => capture("pricing_viewed"),

  /** Feature section scrolled into view */
  featureViewed: (feature: string) =>
    capture("feature_section_viewed", { feature }),

  /** External link clicked (Substack, GitHub, LinkedIn, etc.) */
  externalLinkClicked: (url: string, label: string) =>
    capture("external_link_clicked", { url, link_label: label }),

  /** Video played (demo, promo) */
  videoPlayed: (videoId: string, title: string) =>
    capture("video_played", { video_id: videoId, title }),

  /** Testimonial / social proof section engaged */
  socialProofEngaged: (type: string) =>
    capture("social_proof_engaged", { type }),
};

// ─── Content Engagement ────────────────────────────────────────────

export const content = {
  /** Article / blog post read */
  articleRead: (id: string, title: string, source: string) =>
    capture("article_read", { content_id: id, title, source }),

  /** Content shared */
  shared: (id: string, platform: string) =>
    capture("content_shared", { content_id: id, platform }),

  /** Scroll depth milestone */
  scrollDepth: (percent: number) =>
    capture("scroll_depth", { percent }),
};

// ─── Neuroscience-grounded engagement signals ──────────────────────
// Behavioral proxies for attention, cognitive load, hesitation, and flow.
// Grounded in Fitts's/Hick's law, approach-avoidance, and dual-process theory.

export const neuro = {
  /** First meaningful interaction — time (ms) from load to first click/keypress. Engagement onset. */
  firstInteraction: (msToFirst: number) =>
    capture("neuro_first_interaction", { ms_to_first: msToFirst }),

  /** Attention capture — a key section entered the viewport and held (dwell ≥ 1s). */
  attentionCaptured: (section: string, dwellMs: number) =>
    capture("neuro_attention_captured", { section, dwell_ms: dwellMs }),

  /** Dwell time on a section when it leaves the viewport — sustained attention. */
  dwell: (section: string, dwellMs: number) =>
    capture("neuro_dwell", { section, dwell_ms: dwellMs }),

  /** Decision latency — ms a CTA was hovered before it was clicked (Hick/Fitts). */
  decisionLatency: (cta: string, hoverMs: number) =>
    capture("neuro_decision_latency", { cta, hover_ms: hoverMs }),

  /** Hesitation — CTA hovered ≥ 600ms then abandoned without a click (approach-avoidance). */
  hesitation: (cta: string, hoverMs: number) =>
    capture("neuro_hesitation", { cta, hover_ms: hoverMs }),

  /** Rage click — ≥ 3 rapid clicks in a small area (frustration / high cognitive load). */
  rageClick: (target: string, count: number) =>
    capture("neuro_rage_click", { target, count }),

  /** Dead click — a click on a non-interactive element (confusion signal). */
  deadClick: (target: string) => capture("neuro_dead_click", { target }),

  /** Scroll thrash — rapid up/down reversals in a short window (disorientation / load). */
  scrollThrash: (reversals: number) =>
    capture("neuro_scroll_thrash", { reversals }),

  /** Flow state — sustained forward scroll with no backtracking over a long stretch. */
  flowState: (distancePx: number, durationMs: number) =>
    capture("neuro_flow_state", { distance_px: distancePx, duration_ms: durationMs }),

  /** Reading vs skimming, inferred from scroll velocity over text-heavy content. */
  readingMode: (mode: "reading" | "skimming", pxPerSec: number) =>
    capture("neuro_reading_mode", { mode, px_per_sec: pxPerSec }),

  /** Exit intent — cursor accelerated toward the top/close (loss-aversion moment). */
  exitIntent: (scrollDepthPct: number) =>
    capture("neuro_exit_intent", { scroll_depth_pct: scrollDepthPct }),

  /** Engaged session — met a dwell + scroll + interaction threshold (quality visit). */
  engagedSession: (dwellMs: number, maxScrollPct: number, interactions: number) =>
    capture("neuro_engaged_session", {
      dwell_ms: dwellMs,
      max_scroll_pct: maxScrollPct,
      interactions,
    }),
};

// ─── Product-Specific Events ───────────────────────────────────────

export const product = {
  /** Generic product event — use for product-specific tracking */
  track: (event: string, properties?: Record<string, unknown>) =>
    capture(event, properties),
};

// ─── UTM & Attribution ─────────────────────────────────────────────

/**
 * Capture UTM parameters and referrer on page load.
 * PostHog autocaptures these but this ensures they're
 * available as user properties for segmentation.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }

  if (Object.keys(utm).length === 0) return;

  const ph = getPostHog();
  if (!ph?.__loaded) return;

  ph.register(utm);
  ph.setPersonProperties(utm);
}
