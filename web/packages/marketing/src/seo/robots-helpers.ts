/**
 * Shared robots.txt generators for all SA9 marketing sites.
 * Centralizes AI crawler blocking and standard crawl rules.
 */

import type { MetadataRoute } from "next";

/** AI crawlers and scrapers that should be blocked from indexing site content. */
export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "anthropic-ai",
  "Claude-Web",
  "ClaudeBot",
  "PerplexityBot",
  "CCBot",
  "Omgilibot",
  "Omgili",
  "DataForSeoBot",
  "PetalBot",
  "Bytespider",
  "Diffbot",
  "ImagesiftBot",
  "Applebot-Extended",
  "cohere-ai",
  "FacebookBot",
  "Google-Extended",
] as const;

/** Standard search engine crawlers that should be allowed. */
export const SEARCH_ENGINE_USER_AGENTS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  "Slurp",
  "Yandex",
] as const;

/** Social media preview bots that should be allowed. */
export const SOCIAL_PREVIEW_USER_AGENTS = [
  "Twitterbot",
  "LinkedInBot",
  "facebookexternalhit",
  "Slackbot",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
] as const;

export interface RobotsOptions {
  /** Block page indexing entirely (useful for staging). Default: false */
  noIndex?: boolean;
  /** Block AI crawlers from scraping content. Default: true */
  blockAiCrawlers?: boolean;
  /** Paths to disallow for all crawlers. Default: ["/api/", "/_next/"] */
  disallowPaths?: string[];
  /** Extra paths to allow for social preview bots (e.g., "/api/og"). Default: [] */
  socialAllowPaths?: string[];
}

/**
 * Generate a standard robots.txt configuration for an SA9 marketing site.
 *
 * @param sitemapUrl - Full URL to the sitemap.xml
 * @param options - Customization options
 */
export function standardRobots(
  sitemapUrl: string,
  options: RobotsOptions = {},
): MetadataRoute.Robots {
  const {
    noIndex = false,
    blockAiCrawlers = true,
    disallowPaths = ["/api/", "/_next/"],
    socialAllowPaths = [],
  } = options;

  // Staging or noIndex mode: block everything
  if (noIndex) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: sitemapUrl,
    };
  }

  const rules: MetadataRoute.Robots["rules"] = [
    // Search engines: allow everything except internal paths
    {
      userAgent: [...SEARCH_ENGINE_USER_AGENTS],
      allow: "/",
      disallow: disallowPaths,
    },
    // Social preview bots: allow root + OG image endpoints
    {
      userAgent: [...SOCIAL_PREVIEW_USER_AGENTS],
      allow: ["/", ...socialAllowPaths],
    },
    // Default: allow with standard disallows
    {
      userAgent: "*",
      allow: "/",
      disallow: disallowPaths,
    },
  ];

  // AI crawlers: block entirely
  if (blockAiCrawlers) {
    rules.push({
      userAgent: [...AI_CRAWLER_USER_AGENTS],
      disallow: "/",
    });
  }

  return {
    rules,
    sitemap: sitemapUrl,
  };
}
