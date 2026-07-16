import type PostHogLib from "posthog-js";

let posthogInstance: typeof PostHogLib | null = null;
let initPromise: Promise<void> | null = null;

export interface PostHogConfig {
  /** PostHog project API key */
  apiKey?: string;
  /** PostHog ingestion host (defaults to US cloud) */
  apiHost?: string;
  /** SA9 product identifier for cross-site grouping */
  product: string;
  /** Enable debug mode (defaults to NODE_ENV === "development") */
  debug?: boolean;
  /** Enable session replay (defaults to true) */
  sessionReplay?: boolean;
}

export function initPostHog(config: PostHogConfig): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === "undefined") return;

    const key = config.apiKey ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = config.apiHost ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    if (!key) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[@sa9/analytics] NEXT_PUBLIC_POSTHOG_KEY not set — analytics disabled for ${config.product}`);
      }
      return;
    }

    const { default: posthog } = await import("posthog-js");

    // Register SA9 super properties + product group. Extracted so both the
    // fresh-init (`loaded` callback) and the already-loaded re-init paths apply
    // them — otherwise a second product mounting on an already-initialized
    // instance would emit events without $sa9_product or the product group.
    const registerSa9Properties = (ph: typeof posthog) => {
      ph.register({
        $sa9_product: config.product,
        $sa9_env: process.env.NODE_ENV ?? "production",
      });
      ph.group("product", config.product);

      if (config.debug ?? process.env.NODE_ENV === "development") {
        ph.debug();
      }
    };

    if (posthog.__loaded) {
      registerSa9Properties(posthog);
      posthogInstance = posthog;
      return;
    }

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      persistence: "localStorage+cookie",
      cross_subdomain_cookie: true,
      property_denylist: ["$ip"],
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      loaded: (ph) => {
        registerSa9Properties(ph);
      },
    });

    posthogInstance = posthog;
  })();

  return initPromise;
}

export function getPostHog(): typeof PostHogLib | null {
  return posthogInstance;
}

export function resetPostHog(): void {
  posthogInstance?.reset();
}
