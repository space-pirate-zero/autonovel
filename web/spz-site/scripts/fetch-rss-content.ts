/**
 * fetch-rss-content.ts
 *
 * Fetches the full HTML content for Substack articles from the RSS feed
 * and writes it into the content JSON files as `html_content`.
 *
 * Run with:  npx tsx scripts/fetch-rss-content.ts
 */

import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FEED_URL = 'https://spacepiratezero.substack.com/feed';
const CONTENT_DIR = path.join(process.cwd(), 'src', 'lib', 'content');

// JSON files that may contain Substack articles
const TARGET_FILES = ['index.json', 'articles.json'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RssItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  contentEncoded?: string;
  content?: string;
  summary?: string;
};

type ContentRecord = Record<string, unknown> & {
  rss_guid?: string;
  url?: string;
  html_content?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a URL so trailing slashes / query strings don't cause mismatches */
function normalise(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    // Strip query params and hash for comparison, keep path
    return (u.origin + u.pathname).replace(/\/$/, '').toLowerCase();
  } catch {
    return url.replace(/\/$/, '').toLowerCase();
  }
}

// ---------------------------------------------------------------------------
// Fetch RSS feed
// ---------------------------------------------------------------------------

async function fetchFeedItems(): Promise<Map<string, string>> {
  console.log(`\nFetching RSS feed: ${FEED_URL}`);

  const parser = new Parser<Record<string, unknown>, RssItem>({
    customFields: {
      item: [
        ['content:encoded', 'contentEncoded'],
        ['content:encodedSnippet', 'content'],
      ],
    },
  });

  const feed = await parser.parseURL(FEED_URL);
  console.log(`  Found ${feed.items.length} items in feed`);

  // Build a map from normalised URL → full HTML content
  const htmlByUrl = new Map<string, string>();

  for (const item of feed.items) {
    const html = item.contentEncoded || item.content || '';
    if (!html) continue;

    // Substack RSS: link and guid are typically the same canonical URL
    const urls = [item.link, item.guid].filter(Boolean) as string[];
    for (const url of urls) {
      htmlByUrl.set(normalise(url), html);
    }
  }

  console.log(`  Mapped HTML content for ${htmlByUrl.size} unique URLs`);
  return htmlByUrl;
}

// ---------------------------------------------------------------------------
// Patch a single JSON file
// ---------------------------------------------------------------------------

async function patchFile(
  fileName: string,
  htmlByUrl: Map<string, string>,
): Promise<{ updated: number; skipped: number; missing: number }> {
  const filePath = path.join(CONTENT_DIR, fileName);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf-8');
  } catch {
    console.log(`  [SKIP] ${fileName} — file not found`);
    return { updated: 0, skipped: 0, missing: 0 };
  }

  const items: ContentRecord[] = JSON.parse(raw);
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const item of items) {
    // Only process Substack articles (skip patents, press, video-press, etc.)
    const contentType = (item.content_type as string | undefined || '').toLowerCase();
    const isSubstackArticle =
      contentType === 'article' &&
      ((item.rss_guid as string | undefined) || '').includes('substack.com');

    if (!isSubstackArticle) {
      skipped++;
      continue;
    }

    const key = normalise(item.rss_guid as string) || normalise(item.url as string);
    const html = htmlByUrl.get(key);

    if (!html) {
      console.log(`  [MISSING] "${item.title}" — no RSS match for: ${key}`);
      missing++;
      continue;
    }

    if (item.html_content === html) {
      skipped++;
      continue; // already up to date
    }

    item.html_content = html;
    updated++;
    console.log(`  [OK] "${item.title}"`);
  }

  if (updated > 0) {
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
    console.log(`  Wrote ${updated} updates → ${fileName}`);
  } else {
    console.log(`  No changes needed for ${fileName}`);
  }

  return { updated, skipped, missing };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Space Pirate Zero — RSS Content Fetcher ===');

  const htmlByUrl = await fetchFeedItems();

  let totalUpdated = 0;
  let totalMissing = 0;

  for (const fileName of TARGET_FILES) {
    console.log(`\nProcessing ${fileName}…`);
    const { updated, missing } = await patchFile(fileName, htmlByUrl);
    totalUpdated += updated;
    totalMissing += missing;
  }

  console.log('\n=== Done ===');
  console.log(`  Articles updated: ${totalUpdated}`);
  console.log(`  Articles missing from RSS: ${totalMissing}`);

  if (totalMissing > 0) {
    console.log(
      '\n  NOTE: Missing articles may be paywalled (subscribers only) or\n' +
      '  not yet published to the RSS feed. Check the Substack dashboard.',
    );
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
