"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, getPostHog, type PostHogConfig } from "./posthog";
import { identifyFromClerkGlobal } from "./identify";
import { captureAttribution } from "./events";

interface SA9AnalyticsProps {
  /** SA9 product name — used for grouping and super properties */
  product: PostHogConfig["product"];
  /** Optional PostHog API key override (defaults to NEXT_PUBLIC_POSTHOG_KEY) */
  apiKey?: string;
  /** Optional PostHog host override */
  apiHost?: string;
  /** Enable Clerk user identification (defaults to true if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set) */
  identifyClerk?: boolean;
}

export function SA9Analytics({
  product,
  apiKey,
  apiHost,
  identifyClerk,
}: SA9AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  const shouldIdentify =
    identifyClerk ?? !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Initialize PostHog on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    void initPostHog({ product, apiKey, apiHost }).then(() => {
      captureAttribution();
    });
  }, [product, apiKey, apiHost]);

  // Track page views on route change
  useEffect(() => {
    const ph = getPostHog();
    if (!ph?.__loaded) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  // Identify Clerk user
  useEffect(() => {
    if (!shouldIdentify) return;
    return identifyFromClerkGlobal();
  }, [shouldIdentify]);

  return null;
}
