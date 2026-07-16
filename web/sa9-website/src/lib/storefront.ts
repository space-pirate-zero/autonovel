/**
 * Storefront feature flag.
 *
 * When the store is closed (`NEXT_PUBLIC_STORE_OPEN !== "true"`), all pricing
 * shows "Coming Soon" and checkout is disabled — only waitlist/subscribe CTAs
 * are shown. Toggle via Makefile: `make store-open` / `make store-close`.
 */
export const STORE_OPEN = process.env.NEXT_PUBLIC_STORE_OPEN === "true";
