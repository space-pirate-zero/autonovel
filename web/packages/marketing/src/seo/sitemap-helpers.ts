/**
 * Shared sitemap utilities for all SA9 marketing sites.
 * Generates MetadataRoute.Sitemap-compatible entries for Next.js App Router.
 */

import type { MetadataRoute } from "next";

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface PageEntry {
  path: string;
  priority: number;
  freq: ChangeFreq;
}

/**
 * Standard pages shared by all SA9 marketing sites.
 * Use as a baseline and override/extend per-site.
 */
export const COMMON_SA9_PAGES: PageEntry[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/about", priority: 0.7, freq: "monthly" },
  { path: "/blog", priority: 0.8, freq: "weekly" },
  { path: "/privacy", priority: 0.3, freq: "yearly" },
  { path: "/terms", priority: 0.3, freq: "yearly" },
];

/**
 * Generate static sitemap entries from a list of page definitions.
 *
 * @param baseUrl - The site's base URL (no trailing slash)
 * @param pages - Array of page paths with priority and change frequency
 * @param lastModified - Date for lastModified (defaults to build date)
 */
export function staticPages(
  baseUrl: string,
  pages: PageEntry[],
  lastModified?: Date | string,
): MetadataRoute.Sitemap {
  const mod = lastModified ?? new Date();

  return pages.map((page) => ({
    url: page.path === "/" ? baseUrl : `${baseUrl}${page.path}`,
    lastModified: mod,
    changeFrequency: page.freq,
    priority: page.priority,
  }));
}

/**
 * Generate localized sitemap entries for multi-locale sites.
 * Creates one entry per page per locale with hreflang alternates.
 *
 * @param baseUrl - The site's base URL (no trailing slash)
 * @param pages - Array of page paths with priority and change frequency
 * @param locales - Array of locale codes (e.g., ["en", "es", "fr"])
 * @param defaultLocale - The default locale (omitted from URL path). Defaults to "en".
 * @param lastModified - Date for lastModified (defaults to build date)
 */
export function localizedPages(
  baseUrl: string,
  pages: PageEntry[],
  locales: string[],
  defaultLocale = "en",
  lastModified?: Date | string,
): MetadataRoute.Sitemap {
  const mod = lastModified ?? new Date();

  return pages.flatMap((page) =>
    locales.map((locale) => {
      const isDefault = locale === defaultLocale;
      const pathSegment = page.path === "/" ? "" : page.path;
      const url = isDefault
        ? `${baseUrl}${pathSegment}` || baseUrl
        : `${baseUrl}/${locale}${pathSegment}`;

      const alternates: Record<string, string> = {};
      for (const alt of locales) {
        const altIsDefault = alt === defaultLocale;
        const altPath = page.path === "/" ? "" : page.path;
        alternates[alt] = altIsDefault
          ? `${baseUrl}${altPath}` || baseUrl
          : `${baseUrl}/${alt}${altPath}`;
      }
      alternates["x-default"] = `${baseUrl}${pathSegment}` || baseUrl;

      return {
        url,
        lastModified: mod,
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: {
          languages: alternates,
        },
      };
    }),
  );
}
