import { describe, it, expect } from "vitest";
import { staticPages, localizedPages, COMMON_SA9_PAGES } from "../seo/sitemap-helpers";

// ─── COMMON_SA9_PAGES ───────────────────────────────────────────────────

describe("COMMON_SA9_PAGES", () => {
  it("contains root page with priority 1.0", () => {
    const root = COMMON_SA9_PAGES.find((p) => p.path === "/");
    expect(root).toBeDefined();
    expect(root!.priority).toBe(1.0);
  });

  it("contains standard legal pages", () => {
    const paths = COMMON_SA9_PAGES.map((p) => p.path);
    expect(paths).toContain("/privacy");
    expect(paths).toContain("/terms");
  });

  it("legal pages have low priority", () => {
    for (const page of COMMON_SA9_PAGES) {
      if (["/privacy", "/terms"].includes(page.path)) {
        expect(page.priority).toBeLessThanOrEqual(0.5);
      }
    }
  });

  it("all paths start with /", () => {
    for (const page of COMMON_SA9_PAGES) {
      expect(page.path).toMatch(/^\//);
    }
  });

  it("all priorities are between 0 and 1", () => {
    for (const page of COMMON_SA9_PAGES) {
      expect(page.priority).toBeGreaterThanOrEqual(0);
      expect(page.priority).toBeLessThanOrEqual(1);
    }
  });

  it("all change frequencies are valid", () => {
    const validFreqs = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);
    for (const page of COMMON_SA9_PAGES) {
      expect(validFreqs.has(page.freq)).toBe(true);
    }
  });
});

// ─── staticPages ────────────────────────────────────────────────────────

describe("staticPages", () => {
  const baseUrl = "https://example.com";

  it("generates correct URLs from paths", () => {
    const pages = [
      { path: "/", priority: 1.0, freq: "weekly" as const },
      { path: "/about", priority: 0.7, freq: "monthly" as const },
    ];
    const result = staticPages(baseUrl, pages);
    expect(result[0].url).toBe("https://example.com");
    expect(result[1].url).toBe("https://example.com/about");
  });

  it("root path maps to baseUrl without trailing slash", () => {
    const result = staticPages(baseUrl, [{ path: "/", priority: 1.0, freq: "weekly" }]);
    expect(result[0].url).toBe("https://example.com");
  });

  it("preserves priority values", () => {
    const pages = [
      { path: "/a", priority: 0.9, freq: "daily" as const },
      { path: "/b", priority: 0.1, freq: "yearly" as const },
    ];
    const result = staticPages(baseUrl, pages);
    expect(result[0].priority).toBe(0.9);
    expect(result[1].priority).toBe(0.1);
  });

  it("preserves change frequency", () => {
    const result = staticPages(baseUrl, [{ path: "/", priority: 1, freq: "hourly" }]);
    expect(result[0].changeFrequency).toBe("hourly");
  });

  it("uses provided lastModified date", () => {
    const date = new Date("2026-04-13");
    const result = staticPages(baseUrl, [{ path: "/", priority: 1, freq: "weekly" }], date);
    expect(result[0].lastModified).toEqual(date);
  });

  it("defaults lastModified to a Date object", () => {
    const result = staticPages(baseUrl, [{ path: "/", priority: 1, freq: "weekly" }]);
    expect(result[0].lastModified).toBeInstanceOf(Date);
  });

  it("handles empty pages array", () => {
    const result = staticPages(baseUrl, []);
    expect(result).toEqual([]);
  });

  it("returns same number of entries as input", () => {
    const pages = Array.from({ length: 50 }, (_, i) => ({
      path: `/page-${i}`,
      priority: 0.5,
      freq: "weekly" as const,
    }));
    const result = staticPages(baseUrl, pages);
    expect(result).toHaveLength(50);
  });
});

// ─── localizedPages ─────────────────────────────────────────────────────

describe("localizedPages", () => {
  const baseUrl = "https://example.com";
  const pages = [
    { path: "/", priority: 1.0, freq: "weekly" as const },
    { path: "/about", priority: 0.7, freq: "monthly" as const },
  ];
  const locales = ["en", "es", "fr"];

  it("generates entries for each page × locale combination", () => {
    const result = localizedPages(baseUrl, pages, locales);
    expect(result).toHaveLength(pages.length * locales.length);
  });

  it("default locale URL has no locale prefix", () => {
    const result = localizedPages(baseUrl, pages, locales, "en");
    const enRoot = result.find((e) => e.url === "https://example.com");
    expect(enRoot).toBeDefined();
  });

  it("non-default locale URLs have locale prefix", () => {
    const result = localizedPages(baseUrl, pages, locales, "en");
    const esAbout = result.find((e) => e.url === "https://example.com/es/about");
    expect(esAbout).toBeDefined();
  });

  it("each entry has alternates for all locales", () => {
    const result = localizedPages(baseUrl, pages, locales);
    for (const entry of result) {
      const alternates = (entry as Record<string, unknown>).alternates as Record<string, Record<string, string>>;
      expect(alternates.languages).toBeDefined();
      for (const locale of locales) {
        expect(alternates.languages[locale]).toBeDefined();
      }
    }
  });

  it("includes x-default alternate pointing to default locale", () => {
    const result = localizedPages(baseUrl, pages, locales, "en");
    for (const entry of result) {
      const alternates = (entry as Record<string, unknown>).alternates as Record<string, Record<string, string>>;
      expect(alternates.languages["x-default"]).toBeDefined();
      expect(alternates.languages["x-default"]).toMatch(/^https:\/\/example\.com/);
    }
  });

  it("handles single locale (no-op localization)", () => {
    const result = localizedPages(baseUrl, pages, ["en"], "en");
    expect(result).toHaveLength(pages.length);
  });

  it("handles empty pages array", () => {
    const result = localizedPages(baseUrl, [], locales);
    expect(result).toEqual([]);
  });
});
