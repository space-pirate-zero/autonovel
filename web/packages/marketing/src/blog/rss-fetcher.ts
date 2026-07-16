import type { BlogPost } from "../types";

/** Default SPZ Substack RSS feed URL. */
export const SPZ_FEED_URL = "https://spacepiratezero.substack.com/feed";

/** ISR revalidation interval (seconds). Use in Next.js route segments. */
export const BLOG_REVALIDATE = 3600;

/**
 * Extract the first image URL from HTML content.
 * Checks `<img src="...">` patterns within content:encoded or description.
 */
function extractImageFromHtml(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? undefined;
}

/**
 * Extract text content from an XML element by tag name.
 * Handles both regular elements and CDATA sections.
 */
function getTagContent(xml: string, tag: string): string {
  // Handle namespaced tags like content:encoded
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<${escapedTag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${escapedTag}>`,
    "i"
  );
  const match = xml.match(regex);
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

/**
 * Extract the media:content url attribute if present.
 */
function getMediaContentUrl(xml: string): string | undefined {
  const match = xml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  return match?.[1] ?? undefined;
}

/**
 * Extract all <category> values from an item.
 */
function getCategories(itemXml: string): string[] {
  const tags: string[] = [];
  const regex = /<category[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/category>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(itemXml)) !== null) {
    const value = (match[1] ?? match[2] ?? "").trim();
    if (value) tags.push(value);
  }
  return tags;
}

/**
 * Strip HTML tags and decode common entities for plain-text summaries.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Convert a title into a URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Estimate read time from HTML content.
 */
function estimateReadTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 250));
  return `${minutes} min read`;
}

/**
 * Parse a single RSS <item> XML block into a BlogPost.
 */
function parseItem(itemXml: string): BlogPost {
  const title = stripHtml(getTagContent(itemXml, "title"));
  const link = getTagContent(itemXml, "link");
  const pubDate = getTagContent(itemXml, "pubDate");
  const contentEncoded = getTagContent(itemXml, "content:encoded");
  const descriptionRaw = getTagContent(itemXml, "description");
  const author = getTagContent(itemXml, "dc:creator") || getTagContent(itemXml, "author");

  // Prefer content:encoded for image extraction, fall back to description
  const image =
    getMediaContentUrl(itemXml) ??
    extractImageFromHtml(contentEncoded) ??
    extractImageFromHtml(descriptionRaw) ??
    undefined;

  // Use description for the summary, stripping HTML. Only append an ellipsis
  // when the text was actually truncated — comparing against the full length,
  // not a magic `=== 300` (which mis-fires when the content is exactly 300
  // chars, and can't fire when a trailing space is trimmed off the slice).
  const fullDescription = stripHtml(descriptionRaw || contentEncoded);
  const truncated = fullDescription.length > 300;
  const description = truncated
    ? `${fullDescription.slice(0, 300).trimEnd()}...`
    : fullDescription;

  const tags = getCategories(itemXml);
  const readTime = contentEncoded ? estimateReadTime(contentEncoded) : undefined;

  // Guard the date parse per-item: a single malformed pubDate must not produce
  // an Invalid Date (whose toISOString() throws) and null out the whole feed.
  let date: string;
  if (pubDate) {
    const parsed = new Date(pubDate);
    date = Number.isNaN(parsed.getTime())
      ? new Date().toISOString()
      : parsed.toISOString();
  } else {
    date = new Date().toISOString();
  }

  return {
    slug: slugify(title),
    title,
    description,
    date,
    author: author || undefined,
    image,
    tags,
    readTime,
    externalUrl: link || undefined,
  };
}

/**
 * Fetch and parse blog posts from an RSS feed.
 *
 * Pure Node.js implementation — no external RSS parser dependency.
 * Returns an empty array on any failure (network, parse, etc.).
 *
 * @param feedUrl - Full URL to the RSS/Atom feed
 * @param limit  - Maximum number of posts to return (default: 20)
 */
export async function fetchBlogPosts(
  feedUrl: string = SPZ_FEED_URL,
  limit: number = 20
): Promise<BlogPost[]> {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: BLOG_REVALIDATE },
      headers: {
        "User-Agent": "SA9-Marketing-Blog/1.0",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      console.error(`[rss-fetcher] Feed fetch failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const xml = await response.text();

    // Split into individual <item> blocks
    const items: string[] = [];
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null) {
      items.push(match[0]);
    }

    const posts = items.slice(0, limit).map(parseItem);

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch (error) {
    console.error("[rss-fetcher] Failed to fetch or parse RSS feed:", error);
    return [];
  }
}
