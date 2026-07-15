// Signal Corps — UTM Attribution
// Links broadcasts to PostHog analytics via standardized UTM parameters

import { Platform } from "./types.js";

export interface UtmParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term?: string;
}

/**
 * Generate UTM parameters for a broadcast + platform combination.
 * These are appended to all links in published posts so PostHog can
 * attribute traffic back to specific Signal Corps broadcasts.
 */
export function generateUtmParams(
  broadcastId: string,
  platform: Platform,
  postId?: string
): UtmParams {
  return {
    utm_source: platform,
    utm_medium: "social",
    utm_campaign: broadcastId,
    utm_content: postId ?? broadcastId,
  };
}

/**
 * Append UTM parameters to a URL.
 * Handles existing query strings gracefully — never duplicates params.
 */
export function buildAttributedUrl(baseUrl: string, params: UtmParams): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    // Relative or malformed URL — return as-is to avoid breaking content
    return baseUrl;
  }

  // Merge params, but do NOT override any that were explicitly set by the caller
  const entries = Object.entries(params) as [string, string | undefined][];
  for (const [key, value] of entries) {
    if (value !== undefined && !url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

/**
 * Convenience: build an attributed link directly from broadcast + platform identifiers.
 */
export function attributeLink(
  baseUrl: string,
  broadcastId: string,
  platform: Platform,
  postId?: string
): string {
  const utmParams = generateUtmParams(broadcastId, platform, postId);
  return buildAttributedUrl(baseUrl, utmParams);
}
