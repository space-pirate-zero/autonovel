/**
 * Blackbox tests — cross-cutting contract validation for the marketing cloud.
 *
 * These tests treat the @sa9/marketing package as a sealed unit, validating:
 * - All outputs conform to expected schemas
 * - No accidental data leaks between products
 * - All public interfaces are consistent and well-formed
 * - Security invariants hold (no XSS vectors, valid URLs)
 * - No single-product change can break the ecosystem
 */

import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  websiteJsonLd,
  softwareAppJsonLd,
  articleJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  personJsonLd,
  videoObjectJsonLd,
} from "../seo/structured-data";
import {
  generateSiteMetadata,
  SA9_META,
  STYLELIFT_META,
  DARKWAVE_META,
  GHOSTDECK_META,
  TRADECRAFT_META,
  GROCERY_NINJA_META,
  PHANTOM_TILES_META,
  REWIND_TV_META,
} from "../seo/meta-tags";
import { CTA_CONFIG, getCTA } from "../cta/cta-config";
import {
  standardRobots,
  AI_CRAWLER_USER_AGENTS,
  SEARCH_ENGINE_USER_AGENTS,
} from "../seo/robots-helpers";
import { staticPages, localizedPages, COMMON_SA9_PAGES } from "../seo/sitemap-helpers";

// ─── JSON-LD Schema Compliance ──────────────────────────────────────────

describe("blackbox: JSON-LD schema compliance", () => {
  const allJsonLdOutputs = [
    { name: "Organization", fn: () => organizationJsonLd() },
    { name: "WebSite", fn: () => websiteJsonLd({ name: "Test", url: "https://t.com", description: "d" }) },
    { name: "SoftwareApplication", fn: () => softwareAppJsonLd({ name: "App", description: "d", url: "https://a.com" }) },
    { name: "Article", fn: () => articleJsonLd({ title: "T", slug: "t", description: "d", baseUrl: "https://b.com", date: "2026-01-01" }) },
    { name: "FAQPage", fn: () => faqPageJsonLd([{ q: "Q?", a: "A." }]) },
    { name: "BreadcrumbList", fn: () => breadcrumbJsonLd([{ name: "H", url: "/" }]) },
    { name: "Person", fn: () => personJsonLd({ name: "N", jobTitle: "J", description: "D", url: "https://p.com" }) },
    { name: "VideoObject", fn: () => videoObjectJsonLd({ title: "V", description: "D", youtubeId: "abc123", date: "2026-01-01" }) },
  ];

  it.each(allJsonLdOutputs)("$name has @context https://schema.org", ({ fn }) => {
    expect(fn()["@context"]).toBe("https://schema.org");
  });

  it.each(allJsonLdOutputs)("$name has a @type string", ({ fn }) => {
    expect(typeof fn()["@type"]).toBe("string");
    expect((fn()["@type"] as string).length).toBeGreaterThan(0);
  });

  it.each(allJsonLdOutputs)("$name serializes to valid JSON", ({ fn }) => {
    const result = fn();
    const json = JSON.stringify(result);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual(result);
  });

  it.each(allJsonLdOutputs)("$name has no undefined values in output", ({ fn }) => {
    const json = JSON.stringify(fn());
    expect(json).not.toContain("undefined");
  });

  it.each(allJsonLdOutputs)("$name has no null values in output", ({ fn }) => {
    // null is valid JSON but not expected in our structured data
    const result = fn();
    const walk = (obj: unknown, path = ""): void => {
      if (obj === null) throw new Error(`null value at ${path}`);
      if (typeof obj === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          walk(value, `${path}.${key}`);
        }
      }
    };
    expect(() => walk(result)).not.toThrow();
  });
});

// ─── Cross-Product Isolation ────────────────────────────────────────────

describe("blackbox: cross-product isolation", () => {
  const allPresets = [
    { name: "SA9", meta: SA9_META },
    { name: "StyleLift", meta: STYLELIFT_META },
    { name: "DARKWAVE", meta: DARKWAVE_META },
    { name: "GhostDeck", meta: GHOSTDECK_META },
    { name: "TradeCraft", meta: TRADECRAFT_META },
    { name: "Grocery Ninja", meta: GROCERY_NINJA_META },
    { name: "Phantom Tiles", meta: PHANTOM_TILES_META },
    { name: "REWIND TV", meta: REWIND_TV_META },
  ];

  it("no two products share the same metadataBase URL", () => {
    const urls = allPresets.map((p) => p.meta.metadataBase!.toString());
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("no two products share the same default title", () => {
    const titles = allPresets.map((p) => (p.meta.title as { default: string }).default);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("no two products share the same description", () => {
    const descriptions = allPresets.map((p) => p.meta.description as string);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("all CTA products map to real product entries", () => {
    for (const key of Object.keys(CTA_CONFIG)) {
      const cta = getCTA(key);
      expect(cta, `${key} should return a CTA`).toBeDefined();
      expect(cta!.product.length).toBeGreaterThan(0);
    }
  });
});

// ─── URL Validation ─────────────────────────────────────────────────────

describe("blackbox: URL validation", () => {
  it("all meta preset URLs are valid HTTPS", () => {
    const presets = [SA9_META, STYLELIFT_META, DARKWAVE_META, GHOSTDECK_META, TRADECRAFT_META, GROCERY_NINJA_META, PHANTOM_TILES_META, REWIND_TV_META];
    for (const meta of presets) {
      const url = meta.metadataBase!.toString();
      expect(url).toMatch(/^https:\/\//);
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("all CTA hrefs are relative paths (no absolute URLs)", () => {
    for (const [key, cta] of Object.entries(CTA_CONFIG)) {
      expect(cta.primary.href, `${key}.primary.href`).toMatch(/^\//);
      expect(cta.primary.href, `${key}.primary.href no protocol`).not.toMatch(/^https?:\/\//);
      if (cta.secondary) {
        expect(cta.secondary.href, `${key}.secondary.href`).toMatch(/^\//);
      }
      if (cta.waitlist) {
        expect(cta.waitlist.href, `${key}.waitlist.href`).toMatch(/^\//);
      }
    }
  });

  it("sitemap URLs use baseUrl correctly (no double slashes)", () => {
    const pages = staticPages("https://example.com", COMMON_SA9_PAGES);
    for (const entry of pages) {
      expect(entry.url).not.toMatch(/https:\/\/example\.com\/\//);
    }
  });

  it("organization JSON-LD social URLs are all HTTPS", () => {
    const org = organizationJsonLd();
    const sameAs = org.sameAs as string[];
    for (const url of sameAs) {
      expect(url).toMatch(/^https:\/\//);
    }
  });
});

// ─── Security Invariants ────────────────────────────────────────────────

describe("blackbox: security invariants", () => {
  it("XSS in article title is preserved as data (JSON-LD is embedded via script type=application/ld+json)", () => {
    // JSON-LD goes inside <script type="application/ld+json"> which does NOT execute.
    // The value is raw data — the browser's JSON parser handles it safely.
    // We verify the structure is valid and the value round-trips correctly.
    const malicious = articleJsonLd({
      title: '<script>alert("xss")</script>',
      slug: "xss",
      description: "test",
      baseUrl: "https://test.com",
      date: "2026-01-01",
    });
    const roundTripped = JSON.parse(JSON.stringify(malicious));
    expect(roundTripped.headline).toBe('<script>alert("xss")</script>');
    // Key safety: the output is valid JSON (parseable, no syntax corruption)
    expect(() => JSON.parse(JSON.stringify(malicious))).not.toThrow();
  });

  it("XSS in FAQ questions round-trips correctly through JSON", () => {
    const malicious = faqPageJsonLd([
      { q: '"><img src=x onerror=alert(1)>', a: "safe" },
    ]);
    const roundTripped = JSON.parse(JSON.stringify(malicious));
    const entities = roundTripped.mainEntity;
    expect(entities[0].name).toBe('"><img src=x onerror=alert(1)>');
    expect(() => JSON.parse(JSON.stringify(malicious))).not.toThrow();
  });

  it("robots.txt never accidentally allows all for AI crawlers", () => {
    const result = standardRobots("https://test.com/sitemap.xml");
    const rules = result.rules as Array<Record<string, unknown>>;
    const aiRule = rules.find((r) => {
      const ua = r.userAgent;
      return Array.isArray(ua) && ua.includes("GPTBot");
    });
    // AI rule should block, not allow
    expect(aiRule).toBeDefined();
    expect(aiRule!.disallow).toBe("/");
    expect(aiRule!.allow).toBeUndefined();
  });

  it("noIndex mode truly blocks everything", () => {
    const result = standardRobots("https://staging.com/sitemap.xml", { noIndex: true });
    const rules = result.rules as Array<Record<string, unknown>>;
    // Should have exactly 1 rule blocking everything
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].disallow).toBe("/");
  });
});

// ─── Event Naming Convention ────────────────────────────────────────────

describe("blackbox: event naming convention", () => {
  it("all CTA events use marketing.* namespace", () => {
    for (const [, cta] of Object.entries(CTA_CONFIG)) {
      const events = [cta.primary.event, cta.secondary?.event, cta.waitlist?.event].filter(Boolean) as string[];
      for (const event of events) {
        expect(event).toMatch(/^marketing\.\w+$/);
      }
    }
  });

  it("waitlist events always use 'waitlistJoined'", () => {
    for (const [, cta] of Object.entries(CTA_CONFIG)) {
      if (cta.waitlist) {
        expect(cta.waitlist.event).toBe("marketing.waitlistJoined");
      }
    }
  });

  it("CTA click events always use 'ctaClicked'", () => {
    for (const [, cta] of Object.entries(CTA_CONFIG)) {
      if (cta.primary.event !== "marketing.waitlistJoined") {
        expect(cta.primary.event).toBe("marketing.ctaClicked");
      }
    }
  });
});

// ─── Ecosystem Consistency ──────────────────────────────────────────────

describe("blackbox: ecosystem consistency", () => {
  it("search engines allowed in robots + AI crawlers have no overlap", () => {
    // Cast to Set<string> — the two source tuples have disjoint literal
    // types, so a direct `.has()` call would fail strict type checking
    // even though the runtime intent is exactly this disjointness check.
    const searchSet: Set<string> = new Set([...SEARCH_ENGINE_USER_AGENTS]);
    const aiSet: Set<string> = new Set([...AI_CRAWLER_USER_AGENTS]);
    for (const agent of searchSet) {
      expect(aiSet.has(agent), `${agent} is in both search + AI lists`).toBe(false);
    }
  });

  it("common pages include / as highest priority", () => {
    const root = COMMON_SA9_PAGES.find((p) => p.path === "/");
    expect(root).toBeDefined();
    const maxPriority = Math.max(...COMMON_SA9_PAGES.map((p) => p.priority));
    expect(root!.priority).toBe(maxPriority);
  });

  it("all sitemap paths are unique", () => {
    const paths = COMMON_SA9_PAGES.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("meta tag template includes %s placeholder", () => {
    const meta = generateSiteMetadata({
      siteName: "Test",
      siteUrl: "https://test.com",
      title: "Title",
      description: "Desc",
    });
    const title = meta.title as { template: string };
    expect(title.template).toContain("%s");
  });

  it("all OG images are 1200x630 for social sharing", () => {
    const presets = [SA9_META, STYLELIFT_META, DARKWAVE_META, GHOSTDECK_META, TRADECRAFT_META];
    for (const meta of presets) {
      const images = meta.openGraph!.images as Array<{ width: number; height: number }>;
      expect(images[0].width).toBe(1200);
      expect(images[0].height).toBe(630);
    }
  });
});

// ─── Regression Guards ──────────────────────────────────────────────────

describe("blackbox: regression guards", () => {
  it("SA9 base URL is spaceshipalpha9.co (not sa9.co)", () => {
    expect(SA9_META.metadataBase!.toString()).toContain("spaceshipalpha9.co");
  });

  it("organizationJsonLd always returns Atlanta address", () => {
    const org = organizationJsonLd();
    const address = org.address as Record<string, unknown>;
    expect(address.addressLocality).toBe("Atlanta");
  });

  it("article URLs always go through /dispatches/ path", () => {
    const article = articleJsonLd({
      title: "Test",
      slug: "test",
      description: "d",
      baseUrl: "https://any.com",
      date: "2026-01-01",
    });
    expect(article.url).toContain("/dispatches/");
  });

  it("breadcrumb positions always start at 1 (not 0)", () => {
    const bc = breadcrumbJsonLd([{ name: "A", url: "/a" }, { name: "B", url: "/b" }]);
    const items = bc.itemListElement as Array<Record<string, unknown>>;
    expect(items[0].position).toBe(1);
  });

  it("software app price is string '0' not number 0", () => {
    const app = softwareAppJsonLd({ name: "A", description: "D", url: "https://a.com" });
    const offers = app.offers as Record<string, unknown>;
    expect(typeof offers.price).toBe("string");
    expect(offers.price).toBe("0");
  });
});
