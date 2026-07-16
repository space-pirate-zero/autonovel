/**
 * Shared security headers for all SA9 marketing sites.
 *
 * Every site should ship the same baseline response headers so a
 * misconfigured `next.config.ts` can't regress a site's security posture.
 * Use this module from each site's `next.config.ts` headers() function:
 *
 * ```ts
 * import { STANDARD_SECURITY_HEADERS } from "@sa9/marketing/security";
 *
 * async headers() {
 *   return [{ source: "/(.*)", headers: STANDARD_SECURITY_HEADERS }];
 * }
 * ```
 *
 * To add a per-site CSP, pass a directive object to `buildContentSecurityPolicy`
 * and append the resulting entry to the array.
 */

export interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Content Security Policy directive map. Each key is a CSP directive name
 * and the value is the list of allowed sources. Missing directives are
 * omitted from the output — CSP defaults apply.
 */
export interface ContentSecurityPolicyDirectives {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "font-src"?: string[];
  "connect-src"?: string[];
  "frame-src"?: string[];
  "media-src"?: string[];
  "object-src"?: string[];
  "base-uri"?: string[];
  "form-action"?: string[];
  "frame-ancestors"?: string[];
  "report-uri"?: string[];
  "upgrade-insecure-requests"?: boolean;
  [directive: string]: string[] | boolean | undefined;
}

/**
 * Sensible CSP defaults for SA9 marketing sites: self-hosted assets,
 * inline styles (Next.js generates some), Google Fonts, and PostHog.
 * Override per-site where needed.
 */
export const DEFAULT_CSP_DIRECTIVES: ContentSecurityPolicyDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "https://us.i.posthog.com"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "https:"],
  "media-src": ["'self'", "https://storage.googleapis.com", "data:", "blob:"],
  "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
  "connect-src": ["'self'", "https://us.i.posthog.com", "https://us-assets.i.posthog.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": true,
};

/**
 * Serialize a directive map into a Content-Security-Policy header value.
 * Directives are emitted in a stable order for diffability.
 */
export function buildContentSecurityPolicy(
  directives: ContentSecurityPolicyDirectives = DEFAULT_CSP_DIRECTIVES,
): string {
  const entries: string[] = [];
  const keys = Object.keys(directives).sort();
  for (const key of keys) {
    const value = directives[key];
    if (value === undefined || value === false) continue;
    if (value === true) {
      entries.push(key);
      continue;
    }
    if (Array.isArray(value) && value.length > 0) {
      entries.push(`${key} ${value.join(" ")}`);
    }
  }
  return entries.join("; ");
}

/**
 * Baseline security headers (no CSP) that every SA9 marketing site should
 * ship. Use this when the site needs a custom Content-Security-Policy —
 * spread these and append your own CSP entry.
 */
export const BASELINE_SECURITY_HEADERS: ReadonlyArray<SecurityHeader> = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
] as const;

/**
 * Baseline + default CSP. Use this when the site is happy with the shared
 * CSP defaults and doesn't need any site-specific `connect-src` or
 * `frame-src` overrides.
 */
export const STANDARD_SECURITY_HEADERS: ReadonlyArray<SecurityHeader> = [
  ...BASELINE_SECURITY_HEADERS,
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
] as const;

/**
 * Mutable-array copy of `BASELINE_SECURITY_HEADERS` for APIs that require
 * a plain `SecurityHeader[]` (e.g. Next.js headers() return type). Use this
 * when spreading into a headers array to which you plan to append a CSP.
 */
export function baselineSecurityHeaderEntries(): SecurityHeader[] {
  return BASELINE_SECURITY_HEADERS.map((h) => ({ ...h }));
}

/**
 * Mutable-array copy of `STANDARD_SECURITY_HEADERS`. Includes the default
 * CSP. Use this when the site is fine with default CSP directives.
 */
export function standardSecurityHeaderEntries(): SecurityHeader[] {
  return STANDARD_SECURITY_HEADERS.map((h) => ({ ...h }));
}
