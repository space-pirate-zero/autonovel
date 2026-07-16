import { describe, it, expect } from "vitest";
import {
  standardRobots,
  AI_CRAWLER_USER_AGENTS,
  SEARCH_ENGINE_USER_AGENTS,
  SOCIAL_PREVIEW_USER_AGENTS,
} from "../seo/robots-helpers";

// ─── User Agent Lists ───────────────────────────────────────────────────

describe("AI_CRAWLER_USER_AGENTS", () => {
  it("is a non-empty array", () => {
    expect(AI_CRAWLER_USER_AGENTS.length).toBeGreaterThan(0);
  });

  it("contains known AI crawlers", () => {
    const list = [...AI_CRAWLER_USER_AGENTS];
    expect(list).toContain("GPTBot");
    expect(list).toContain("ClaudeBot");
    expect(list).toContain("PerplexityBot");
    expect(list).toContain("CCBot");
  });

  it("contains no empty strings", () => {
    for (const agent of AI_CRAWLER_USER_AGENTS) {
      expect(agent.trim().length).toBeGreaterThan(0);
    }
  });

  it("has no duplicates", () => {
    expect(new Set(AI_CRAWLER_USER_AGENTS).size).toBe(AI_CRAWLER_USER_AGENTS.length);
  });
});

describe("SEARCH_ENGINE_USER_AGENTS", () => {
  it("includes Googlebot and Bingbot", () => {
    const list = [...SEARCH_ENGINE_USER_AGENTS];
    expect(list).toContain("Googlebot");
    expect(list).toContain("Bingbot");
  });

  it("has no duplicates", () => {
    expect(new Set(SEARCH_ENGINE_USER_AGENTS).size).toBe(SEARCH_ENGINE_USER_AGENTS.length);
  });
});

describe("SOCIAL_PREVIEW_USER_AGENTS", () => {
  it("includes major social bots", () => {
    const list = [...SOCIAL_PREVIEW_USER_AGENTS];
    expect(list).toContain("Twitterbot");
    expect(list).toContain("LinkedInBot");
    expect(list).toContain("facebookexternalhit");
  });

  it("does not overlap with AI crawler list", () => {
    // Widen to Set<string> — the disjoint literal types would otherwise
    // reject the `.has()` call at type-check time.
    const aiSet: Set<string> = new Set([...AI_CRAWLER_USER_AGENTS]);
    for (const agent of SOCIAL_PREVIEW_USER_AGENTS) {
      expect(aiSet.has(agent), `${agent} found in AI crawler list`).toBe(false);
    }
  });
});

// ─── standardRobots ─────────────────────────────────────────────────────

describe("standardRobots", () => {
  const sitemapUrl = "https://example.com/sitemap.xml";

  it("includes sitemap URL", () => {
    const result = standardRobots(sitemapUrl);
    expect(result.sitemap).toBe(sitemapUrl);
  });

  it("returns rules array", () => {
    const result = standardRobots(sitemapUrl);
    expect(Array.isArray(result.rules)).toBe(true);
    expect((result.rules as unknown[]).length).toBeGreaterThan(0);
  });

  // ─── Default options ──────────────────────────────────────────────

  describe("with default options", () => {
    const result = standardRobots(sitemapUrl);
    const rules = result.rules as Array<Record<string, unknown>>;

    it("allows search engines", () => {
      const seRule = rules.find((r) => {
        const ua = r.userAgent;
        return Array.isArray(ua) && ua.includes("Googlebot");
      });
      expect(seRule).toBeDefined();
      expect(seRule!.allow).toBe("/");
    });

    it("disallows /api/ and /_next/ for search engines", () => {
      const seRule = rules.find((r) => {
        const ua = r.userAgent;
        return Array.isArray(ua) && ua.includes("Googlebot");
      });
      expect(seRule!.disallow).toContain("/api/");
      expect(seRule!.disallow).toContain("/_next/");
    });

    it("blocks AI crawlers by default", () => {
      const aiRule = rules.find((r) => {
        const ua = r.userAgent;
        return Array.isArray(ua) && ua.includes("GPTBot");
      });
      expect(aiRule).toBeDefined();
      expect(aiRule!.disallow).toBe("/");
    });

    it("allows social preview bots", () => {
      const socialRule = rules.find((r) => {
        const ua = r.userAgent;
        return Array.isArray(ua) && ua.includes("Twitterbot");
      });
      expect(socialRule).toBeDefined();
      expect(socialRule!.allow).toContain("/");
    });

    it("includes wildcard default rule", () => {
      const wildcard = rules.find((r) => r.userAgent === "*");
      expect(wildcard).toBeDefined();
      expect(wildcard!.allow).toBe("/");
    });
  });

  // ─── noIndex mode ─────────────────────────────────────────────────

  describe("with noIndex: true", () => {
    it("blocks everything for all user agents", () => {
      const result = standardRobots(sitemapUrl, { noIndex: true });
      const rules = result.rules as Array<Record<string, unknown>>;
      expect(rules).toHaveLength(1);
      expect(rules[0].userAgent).toBe("*");
      expect(rules[0].disallow).toBe("/");
    });
  });

  // ─── AI crawler blocking disabled ─────────────────────────────────

  describe("with blockAiCrawlers: false", () => {
    it("does not include AI crawler block rule", () => {
      const result = standardRobots(sitemapUrl, { blockAiCrawlers: false });
      const rules = result.rules as Array<Record<string, unknown>>;
      const aiRule = rules.find((r) => {
        const ua = r.userAgent;
        return Array.isArray(ua) && ua.includes("GPTBot");
      });
      expect(aiRule).toBeUndefined();
    });
  });

  // ─── Custom disallow paths ────────────────────────────────────────

  describe("with custom disallowPaths", () => {
    it("uses custom paths instead of defaults", () => {
      const result = standardRobots(sitemapUrl, { disallowPaths: ["/admin/", "/private/"] });
      const rules = result.rules as Array<Record<string, unknown>>;
      const defaultRule = rules.find((r) => r.userAgent === "*");
      expect(defaultRule!.disallow).toContain("/admin/");
      expect(defaultRule!.disallow).toContain("/private/");
      expect(defaultRule!.disallow).not.toContain("/api/");
    });
  });

  // ─── Social allow paths ───────────────────────────────────────────

  describe("with socialAllowPaths", () => {
    it("adds custom paths to social preview bots", () => {
      const result = standardRobots(sitemapUrl, { socialAllowPaths: ["/api/og"] });
      const rules = result.rules as Array<Record<string, unknown>>;
      const socialRule = rules.find((r) => {
        const ua = r.userAgent;
        return Array.isArray(ua) && ua.includes("Twitterbot");
      });
      const allow = socialRule!.allow as string[];
      expect(allow).toContain("/api/og");
    });
  });

  // ─── Critical: Googlebot never blocked ────────────────────────────

  it("CRITICAL: Googlebot is NEVER in the AI blocker list", () => {
    const aiList = [...AI_CRAWLER_USER_AGENTS];
    expect(aiList).not.toContain("Googlebot");
    expect(aiList).not.toContain("Googlebot-Image");
    expect(aiList).not.toContain("Bingbot");
  });

  it("CRITICAL: default config does not block Googlebot", () => {
    const result = standardRobots(sitemapUrl);
    const rules = result.rules as Array<Record<string, unknown>>;
    for (const rule of rules) {
      const ua = rule.userAgent;
      if (rule.disallow === "/") {
        // If a rule blocks everything, ensure Googlebot is not in its user agents
        if (Array.isArray(ua)) {
          expect(ua).not.toContain("Googlebot");
          expect(ua).not.toContain("Bingbot");
        }
        if (ua === "Googlebot" || ua === "Bingbot") {
          throw new Error("Default robots.txt blocks search engines!");
        }
      }
    }
  });
});
