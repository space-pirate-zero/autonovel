/**
 * Live Substack dispatches for spacepiratezero.com.
 * Fetches the Space Pirate Zero Substack RSS with hourly ISR revalidation so
 * the homepage always shows the latest posts. Returns [] on any error (the
 * caller falls back to curated content).
 */
export interface LiveDispatch {
  title: string;
  url: string;
  date: string; // ISO YYYY-MM-DD
  image: string;
  summary: string;
  guid: string;
}

const FEED_URL = "https://spacepiratezero.substack.com/feed";

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#x2019;/g, "’")
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
function firstImage(html: string): string {
  const enc = html.match(/<enclosure[^>]+url="([^"]+)"[^>]*>/i);
  if (enc && /^https:\/\//.test(enc[1]) && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(enc[1])) return enc[1];
  const img = html.match(/<img[^>]+src="(https:\/\/[^"]+)"/i);
  if (img) return img[1];
  return "/og-image.jpg";
}

export async function getLiveDispatches(): Promise<LiveDispatch[]> {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "SpacePirateZero/1.0 (+https://spacepiratezero.com)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.split(/<item>/).slice(1).map((c) => c.split("</item>")[0]);
    const out = items.map((block) => {
      const contentHtml = tag(block, "content:encoded") || tag(block, "description");
      const pub = tag(block, "pubDate");
      return {
        title: tag(block, "title") || "Untitled",
        url: tag(block, "link"),
        date: pub ? new Date(pub).toISOString().slice(0, 10) : "",
        image: firstImage(block),
        summary: stripHtml(contentHtml).slice(0, 200),
        guid: tag(block, "guid") || tag(block, "link"),
      };
    });
    out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return out;
  } catch {
    return [];
  }
}
