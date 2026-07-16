// Signal Corps — Post Template Formatter
// Formats a PostTemplate for each platform, respecting character limits,
// hashtag conventions, link handling, and media attachment differences.

import { Platform, PostTemplate, PLATFORM_CHAR_LIMITS } from "../types.js";
import { attributeLink } from "../attribution.js";

export interface FormattedPost {
  text: string;
  /** `| undefined` so formatter functions can construct literals with `mediaUrls: template.mediaUrls` even when the input was undefined. */
  mediaUrls?: string[] | undefined;
  /** Platform-specific structured data (e.g. Reddit flair, LinkedIn visibility) */
  platformMeta?: Record<string, unknown> | undefined;
}

// ----- helpers ---------------------------------------------------------------

function truncate(text: string, maxLen: number, suffix = "…"): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - suffix.length) + suffix;
}

function appendHashtags(text: string, hashtags: string[], maxLen: number): string {
  const tags = hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  const withTags = `${text}\n\n${tags}`;
  return withTags.length <= maxLen ? withTags : text;
}

function resolveLink(
  template: PostTemplate,
  broadcastId: string,
  platform: Platform
): string | undefined {
  if (!template.linkUrl) return undefined;
  return attributeLink(template.linkUrl, broadcastId, platform);
}

// ----- platform formatters ---------------------------------------------------

function formatTwitter(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.Twitter];
  const link = resolveLink(template, broadcastId, Platform.Twitter);

  // Reserve space for the link (Twitter counts t.co links as 23 chars)
  const linkReserve = link ? 24 : 0; // 23 chars + 1 space
  const textBudget = limit - linkReserve;

  let text = truncate(template.content, textBudget);

  // Add hashtags only if they fit (Twitter hashtags are part of the char count)
  if (template.hashtags?.length) {
    text = appendHashtags(text, template.hashtags.slice(0, 3), textBudget);
  }

  if (link) {
    text = `${text} ${link}`;
  }

  return {
    text: truncate(text, limit),
    mediaUrls: template.mediaUrls,
  };
}

function formatLinkedIn(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.LinkedIn];
  const link = resolveLink(template, broadcastId, Platform.LinkedIn);

  let text = template.content;
  if (template.hashtags?.length) {
    text = appendHashtags(text, template.hashtags, limit);
  }
  if (link) {
    text = `${text}\n\n${link}`;
  }

  return {
    text: truncate(text, limit),
    mediaUrls: template.mediaUrls,
    platformMeta: { visibility: "PUBLIC" },
  };
}

function formatFacebook(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.Facebook];
  const link = resolveLink(template, broadcastId, Platform.Facebook);

  let text = template.content;
  if (template.hashtags?.length) {
    text = appendHashtags(text, template.hashtags, limit);
  }

  return {
    text: truncate(text, limit),
    mediaUrls: template.mediaUrls,
    // link is passed separately to the Graph API as `link` param
    platformMeta: link ? { link } : undefined,
  };
}

function formatInstagram(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.Instagram];
  const link = resolveLink(template, broadcastId, Platform.Instagram);

  // Instagram doesn't support clickable links in captions; note the URL
  const linkNote = link ? `\n\n🔗 Link in bio: ${link}` : "";
  let text = template.content + linkNote;

  if (template.hashtags?.length) {
    // Instagram supports up to 30 hashtags; append all
    const tags = template.hashtags
      .slice(0, 30)
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .join(" ");
    text = `${text}\n\n${tags}`;
  }

  return {
    text: truncate(text, limit),
    // Instagram requires at least one media URL for feed posts
    mediaUrls: template.mediaUrls,
  };
}

function formatBluesky(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.Bluesky];
  const link = resolveLink(template, broadcastId, Platform.Bluesky);

  // Bluesky uses facets for links/hashtags; we embed them inline in text
  let text = template.content;
  if (template.hashtags?.length) {
    const tags = template.hashtags
      .slice(0, 5)
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .join(" ");
    text = appendHashtags(text, template.hashtags.slice(0, 5), limit - (link ? 30 : 0));
    void tags; // used inside appendHashtags
  }
  if (link) {
    text = `${text}\n${link}`;
  }

  return {
    text: truncate(text, limit),
    mediaUrls: template.mediaUrls,
  };
}

function formatReddit(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.Reddit];
  const link = resolveLink(template, broadcastId, Platform.Reddit);

  let text = template.content;
  if (link) {
    text = `${text}\n\n${link}`;
  }

  return {
    text: truncate(text, limit),
    // Reddit doesn't support inline images in text posts via API
    platformMeta: { kind: "self" },
  };
}

function formatSubstack(template: PostTemplate, broadcastId: string): FormattedPost {
  const limit = PLATFORM_CHAR_LIMITS[Platform.Substack];
  const link = resolveLink(template, broadcastId, Platform.Substack);

  // Substack newsletters are long-form; keep the whole body, append hashtags
  // and the link as a trailing line. The adapter wraps paragraphs in <p> tags.
  let text = template.content;
  if (template.hashtags?.length) {
    text = appendHashtags(text, template.hashtags, limit);
  }
  if (link) {
    text = `${text}\n\n${link}`;
  }

  return {
    text: truncate(text, limit),
    mediaUrls: template.mediaUrls,
    platformMeta: { audience: "everyone", type: "newsletter" },
  };
}

// ----- public API ------------------------------------------------------------

const formatters: Record<Platform, (t: PostTemplate, id: string) => FormattedPost> = {
  [Platform.Twitter]: formatTwitter,
  [Platform.LinkedIn]: formatLinkedIn,
  [Platform.Facebook]: formatFacebook,
  [Platform.Instagram]: formatInstagram,
  [Platform.Bluesky]: formatBluesky,
  [Platform.Reddit]: formatReddit,
  [Platform.Substack]: formatSubstack,
};

/**
 * Format a PostTemplate for a specific platform.
 * Handles character limits, hashtag conventions, link attribution, and
 * platform-specific structural differences.
 *
 * @param template  Raw post template from the broadcast
 * @param platform  Target platform
 * @param broadcastId  Used to generate UTM-attributed links
 */
export function formatForPlatform(
  template: PostTemplate,
  platform: Platform,
  broadcastId: string
): FormattedPost {
  const formatter = formatters[platform];
  return formatter(template, broadcastId);
}
