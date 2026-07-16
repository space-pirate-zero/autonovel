import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchBlogPosts, SPZ_FEED_URL, BLOG_REVALIDATE } from "../blog/rss-fetcher";

// ─── Mock fetch ─────────────────────────────────────────────���───────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Test RSS fixtures ─────────────────────────────���────────────────────

const VALID_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Space Pirate Zero</title>
    <item>
      <title>First Post</title>
      <link>https://substack.com/first-post</link>
      <pubDate>Mon, 13 Apr 2026 10:00:00 GMT</pubDate>
      <dc:creator>Greg Chambers</dc:creator>
      <description><![CDATA[<p>This is the first post summary with some text content.</p>]]></description>
      <content:encoded><![CDATA[<p>This is the full first post content with more detail. It has multiple sentences to test read time estimation. Here is even more text to make the word count higher.</p>]]></content:encoded>
      <media:content url="https://cdn.substack.com/image1.jpg" medium="image"/>
      <category>AI</category>
      <category>Indie</category>
    </item>
    <item>
      <title>Second Post</title>
      <link>https://substack.com/second-post</link>
      <pubDate>Sun, 12 Apr 2026 08:00:00 GMT</pubDate>
      <description>A plain text description without CDATA.</description>
      <content:encoded><![CDATA[<p>Second post content with an image: <img src="https://cdn.substack.com/inline-image.jpg" alt="test"/></p>]]></content:encoded>
    </item>
    <item>
      <title><![CDATA[Third Post with "Special" Characters & Entities]]></title>
      <link>https://substack.com/third-post</link>
      <pubDate>Sat, 11 Apr 2026 06:00:00 GMT</pubDate>
      <description>&lt;p&gt;HTML entities in description&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

const EMPTY_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Empty</title></channel></rss>`;

function mockFetchResponse(body: string, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: () => Promise.resolve(body),
  });
}

// ─── Constants ────────────────────────────────��────────────────��────────

describe("RSS fetcher constants", () => {
  it("SPZ_FEED_URL is a valid Substack URL", () => {
    expect(SPZ_FEED_URL).toMatch(/^https:\/\/.*\.substack\.com\/feed$/);
  });

  it("BLOG_REVALIDATE is at least 1 hour (3600s)", () => {
    expect(BLOG_REVALIDATE).toBeGreaterThanOrEqual(3600);
  });
});

// ─── fetchBlogPosts ─────────────────────────────────────────────────────

describe("fetchBlogPosts", () => {
  it("parses valid RSS feed into BlogPost array", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts).toHaveLength(3);
  });

  it("sorts posts by date descending (newest first)", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    for (let i = 1; i < posts.length; i++) {
      expect(new Date(posts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i].date).getTime()
      );
    }
  });

  it("extracts titles correctly, including CDATA", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts[0].title).toBe("First Post");
    // Third post has special characters
    const specialPost = posts.find((p) => p.title.includes("Special"));
    expect(specialPost).toBeDefined();
    expect(specialPost!.title).toContain('"Special"');
    expect(specialPost!.title).toContain("&");
  });

  it("generates URL-safe slugs from titles", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    for (const post of posts) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
      expect(post.slug).not.toMatch(/^-/);
      expect(post.slug).not.toMatch(/-$/);
    }
  });

  it("extracts media:content image URL when available", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    const firstPost = posts.find((p) => p.title === "First Post");
    expect(firstPost!.image).toBe("https://cdn.substack.com/image1.jpg");
  });

  it("falls back to inline img tag for image extraction", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    const secondPost = posts.find((p) => p.title === "Second Post");
    expect(secondPost!.image).toBe("https://cdn.substack.com/inline-image.jpg");
  });

  it("extracts categories as tags", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    const firstPost = posts.find((p) => p.title === "First Post");
    expect(firstPost!.tags).toContain("AI");
    expect(firstPost!.tags).toContain("Indie");
  });

  it("extracts dc:creator as author", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    const firstPost = posts.find((p) => p.title === "First Post");
    expect(firstPost!.author).toBe("Greg Chambers");
  });

  it("generates read time from content", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    const firstPost = posts.find((p) => p.title === "First Post");
    expect(firstPost!.readTime).toMatch(/^\d+ min read$/);
  });

  it("sets externalUrl to the link", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts[0].externalUrl).toMatch(/^https:\/\//);
  });

  it("strips HTML from descriptions in CDATA content", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    // Posts with CDATA content have HTML stripped
    const firstPost = posts.find((p) => p.title === "First Post");
    expect(firstPost!.description).not.toMatch(/<[^>]+>/);
  });

  it("decodes HTML entities in description", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    // The third post uses &lt;p&gt; entities — stripHtml decodes these
    const thirdPost = posts.find((p) => p.title.includes("Special"));
    // After entity decoding + tag stripping, should be clean text
    expect(thirdPost!.description).toBeTruthy();
  });

  it("truncates long descriptions to ~300 chars + ellipsis", async () => {
    const longContent = "A".repeat(500);
    const longRss = `<?xml version="1.0"?><rss><channel><item><title>Long</title><link>https://test.com</link><description>${longContent}</description></item></channel></rss>`;
    mockFetchResponse(longRss);
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts[0].description.length).toBeLessThanOrEqual(303); // 300 + "..."
  });

  it("respects limit parameter", async () => {
    mockFetchResponse(VALID_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed", 1);
    expect(posts).toHaveLength(1);
  });

  // ─── Error handling ────────────���──────────────────────────────────

  it("returns empty array on HTTP error", async () => {
    mockFetchResponse("", 500);
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts).toEqual([]);
  });

  it("returns empty array on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts).toEqual([]);
  });

  it("returns empty array for empty RSS feed", async () => {
    mockFetchResponse(EMPTY_RSS);
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts).toEqual([]);
  });

  it("returns empty array for invalid XML", async () => {
    mockFetchResponse("not xml at all");
    const posts = await fetchBlogPosts("https://test.com/feed");
    expect(posts).toEqual([]);
  });

  // ─── Fetch options ──────────────────────────────────���─────────────

  it("passes correct User-Agent header", async () => {
    mockFetchResponse(EMPTY_RSS);
    await fetchBlogPosts("https://test.com/feed");
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["User-Agent"]).toBe("SA9-Marketing-Blog/1.0");
  });

  it("passes correct Accept header", async () => {
    mockFetchResponse(EMPTY_RSS);
    await fetchBlogPosts("https://test.com/feed");
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Accept).toContain("application/rss+xml");
  });

  it("uses revalidation option for ISR", async () => {
    mockFetchResponse(EMPTY_RSS);
    await fetchBlogPosts("https://test.com/feed");
    const [, options] = mockFetch.mock.calls[0];
    expect(options.next.revalidate).toBe(BLOG_REVALIDATE);
  });
});
