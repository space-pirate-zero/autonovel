/**
 * Live Substack dispatches.
 *
 * Fetches the Space Pirate Zero Substack RSS at request time with hourly ISR
 * revalidation, so the site always reflects the latest posts without a rebuild.
 * Falls back to the curated static list in `./dispatches` on any error.
 */
import { dispatches as fallbackDispatches, type Dispatch } from "./dispatches";

const FEED_URL = "https://spacepiratezero.substack.com/feed";
const REVALIDATE_SECONDS = 3600; // refresh at most once an hour

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#x2019;/g, "’")
    .replace(/&#8216;|&#x2018;/g, "‘")
    .replace(/&#8212;|&#x2014;/g, "—")
    .replace(/&#8211;|&#x2013;/g, "–")
    .replace(/&nbsp;/g, " ");
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]).trim() : "";
}

function stripHtml(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function slugFromLink(link: string, i: number): string {
  const m = link.match(/\/p\/([^/?#]+)/);
  return m ? m[1] : `dispatch-${i}`;
}

function firstImage(html: string): string {
  const enc = html.match(/<enclosure[^>]+url="([^"]+)"[^>]*>/i);
  if (enc && /^https:\/\//.test(enc[1]) && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(enc[1])) return enc[1];
  const img = html.match(/<img[^>]+src="(https:\/\/[^"]+)"/i);
  if (img) return img[1];
  const media = html.match(/<media:content[^>]+url="(https:\/\/[^"]+)"/i);
  if (media) return media[1];
  return "/og-image.jpg";
}

/**
 * Return the latest dispatches from Substack (newest first).
 * Server-only — uses `fetch` with Next.js revalidation.
 */
export async function getDispatches(): Promise<Dispatch[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "SpaceshipAlpha9/1.0 (+https://spaceshipalpha9.co)" },
    });
    if (!res.ok) throw new Error(`Substack RSS ${res.status}`);
    const xml = await res.text();

    const items = xml.split(/<item>/).slice(1).map((chunk) => chunk.split("</item>")[0]);
    if (items.length === 0) throw new Error("no items");

    const parsed: Dispatch[] = items.map((block, i) => {
      const title = tag(block, "title") || "Untitled";
      const link = tag(block, "link");
      const pub = tag(block, "pubDate");
      const date = pub ? new Date(pub).toISOString().slice(0, 10) : "";
      const contentHtml = tag(block, "content:encoded") || tag(block, "description");
      const summary = stripHtml(contentHtml).slice(0, 220);
      return {
        id: i + 1,
        title,
        slug: slugFromLink(link, i),
        url: link,
        date,
        image: firstImage(block),
        description: summary,
        summary,
        tags: [],
        seoKeywords: [],
        author: "Space Pirate Zero",
        rss_guid: tag(block, "guid") || link,
      };
    });

    parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return parsed;
  } catch {
    // Network/parse failure — serve the curated fallback (already sorted below).
    return [...fallbackDispatches].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}
