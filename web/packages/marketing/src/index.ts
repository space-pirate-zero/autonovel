export type { DesignSystem, SiteConfig, NavItem, BlogPost } from "./types";

// ── Registry ──────────────────────────────────────────────────────────
export {
  MARKETING_SITES,
  getMarketingSite,
  internalHealthUrl,
  publicHealthUrl,
} from "./registry/sites";
export type { MarketingSite } from "./registry/sites";

// ── Security ──────────────────────────────────────────────────────────
export {
  BASELINE_SECURITY_HEADERS,
  STANDARD_SECURITY_HEADERS,
  baselineSecurityHeaderEntries,
  standardSecurityHeaderEntries,
  buildContentSecurityPolicy,
  DEFAULT_CSP_DIRECTIVES,
} from "./security/headers";
export type { SecurityHeader, ContentSecurityPolicyDirectives } from "./security/headers";
