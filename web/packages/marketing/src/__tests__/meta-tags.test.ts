import { describe, it, expect } from "vitest";
import {
  generateSiteMetadata,
  SA9_META,
  STYLELIFT_META,
  DARKWAVE_META,
  GHOSTDECK_META,
  TRADECRAFT_META,
  GROCERY_NINJA_META,
  PHANTOM_TILES_META,
  REWIND_TV_META,
} from "../seo/meta-tags";

// ─── generateSiteMetadata ───────────────────────────────────────────────

describe("generateSiteMetadata", () => {
  const baseConfig = {
    siteName: "Test Site",
    siteUrl: "https://test.example.com",
    title: "Test Title",
    description: "Test description",
  };

  it("returns a Metadata-shaped object", () => {
    const meta = generateSiteMetadata(baseConfig);
    expect(meta).toBeDefined();
    expect(meta.title).toBeDefined();
    expect(meta.description).toBe("Test description");
  });

  it("sets metadataBase from siteUrl", () => {
    const meta = generateSiteMetadata(baseConfig);
    expect(meta.metadataBase).toEqual(new URL("https://test.example.com"));
  });

  it("creates template title with siteName", () => {
    const meta = generateSiteMetadata(baseConfig);
    const title = meta.title as { default: string; template: string };
    expect(title.default).toBe("Test Title");
    expect(title.template).toBe("%s | Test Site");
  });

  it("includes author as Space Pirate Zero", () => {
    const meta = generateSiteMetadata(baseConfig);
    const authors = meta.authors as Array<{ name: string; url: string }>;
    expect(authors).toContainEqual({
      name: "Space Pirate Zero",
      url: "https://spacepiratezero.com",
    });
  });

  it("sets creator and publisher to SA9", () => {
    const meta = generateSiteMetadata(baseConfig);
    expect(meta.creator).toBe("Spaceship Alpha 9");
    expect(meta.publisher).toBe("Spaceship Alpha 9");
  });

  // ─── OpenGraph ──────────────────────────────────────────────────────

  it("populates OpenGraph with all required fields", () => {
    const meta = generateSiteMetadata(baseConfig);
    // Next.js's `OpenGraph` is a discriminated union whose `type` field
    // is only accessible on specific narrowed sub-types. For test
    // assertions we widen to a structural shape so we can read the
    // fields regardless of which union variant TypeScript chose.
    const og = meta.openGraph! as unknown as {
      type: string;
      title: string;
      description: string;
      siteName: string;
      url: string;
    };
    expect(og.type).toBe("website");
    expect(og.title).toBe("Test Title");
    expect(og.description).toBe("Test description");
    expect(og.siteName).toBe("Test Site");
    expect(og.url).toBe("https://test.example.com");
  });

  it("uses provided ogImage for OpenGraph", () => {
    const meta = generateSiteMetadata({ ...baseConfig, ogImage: "https://cdn.example.com/og.jpg" });
    const images = meta.openGraph!.images as Array<{ url: string }>;
    expect(images[0].url).toBe("https://cdn.example.com/og.jpg");
  });

  it("defaults ogImage to /og-image.jpg", () => {
    const meta = generateSiteMetadata(baseConfig);
    const images = meta.openGraph!.images as Array<{ url: string }>;
    expect(images[0].url).toBe("https://test.example.com/og-image.jpg");
  });

  it("sets og image dimensions to 1200x630", () => {
    const meta = generateSiteMetadata(baseConfig);
    const images = meta.openGraph!.images as Array<{ width: number; height: number }>;
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });

  // ─── Twitter Card ───────────────────────────────────────────────────

  it("populates Twitter card with summary_large_image", () => {
    const meta = generateSiteMetadata(baseConfig);
    // Twitter metadata is also a union type; widen for test assertions.
    const twitter = meta.twitter! as unknown as {
      card: string;
      title: string;
      description: string;
    };
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.title).toBe("Test Title");
    expect(twitter.description).toBe("Test description");
  });

  it("defaults twitterHandle to @SpacePirateZero", () => {
    const meta = generateSiteMetadata(baseConfig);
    expect(meta.twitter!.creator).toBe("@SpacePirateZero");
  });

  it("uses custom twitterHandle when provided", () => {
    const meta = generateSiteMetadata({ ...baseConfig, twitterHandle: "@customHandle" });
    expect(meta.twitter!.creator).toBe("@customHandle");
  });

  // ─── Robots ─────────────────────────────────────────────────────────

  it("allows indexing by default", () => {
    const meta = generateSiteMetadata(baseConfig);
    const robots = meta.robots as Record<string, unknown>;
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it("blocks indexing when noIndex is true", () => {
    const meta = generateSiteMetadata({ ...baseConfig, noIndex: true });
    const robots = meta.robots as Record<string, unknown>;
    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });

  // ─── Canonical & Alternates ─────────────────────────────────────────

  it("sets canonical to siteUrl by default", () => {
    const meta = generateSiteMetadata(baseConfig);
    expect(meta.alternates!.canonical).toBe("https://test.example.com");
  });

  it("uses custom canonicalUrl when provided", () => {
    const meta = generateSiteMetadata({ ...baseConfig, canonicalUrl: "https://canonical.example.com" });
    expect(meta.alternates!.canonical).toBe("https://canonical.example.com");
  });

  // ─── Keywords ───────────────────────────────────────────────────────

  it("includes keywords when provided", () => {
    const meta = generateSiteMetadata({ ...baseConfig, keywords: ["ai", "tools"] });
    expect(meta.keywords).toEqual(["ai", "tools"]);
  });

  it("omits keywords when not provided", () => {
    const meta = generateSiteMetadata(baseConfig);
    expect(meta.keywords).toBeUndefined();
  });

  // ─── Icons ──────────────────────────────────────────────────────────

  it("includes favicon and apple touch icon", () => {
    const meta = generateSiteMetadata(baseConfig);
    const icons = meta.icons as Record<string, unknown>;
    expect(icons.icon).toBeDefined();
    expect(icons.apple).toBe("/apple-touch-icon.png");
  });
});

// ─── Product Presets ────────────────────────────────────────────────────

describe("product meta presets", () => {
  const presets = [
    { name: "SA9", meta: SA9_META, expectedSite: "Spaceship Alpha 9" },
    { name: "StyleLift", meta: STYLELIFT_META, expectedSite: "StyleLift" },
    { name: "DARKWAVE", meta: DARKWAVE_META, expectedSite: "DARKWAVE" },
    { name: "GhostDeck", meta: GHOSTDECK_META, expectedSite: "GhostDeck" },
    { name: "TradeCraft", meta: TRADECRAFT_META, expectedSite: "TradeCraft" },
    { name: "Grocery Ninja", meta: GROCERY_NINJA_META, expectedSite: "Grocery Ninja" },
    { name: "Phantom Tiles", meta: PHANTOM_TILES_META, expectedSite: "Phantom Tiles" },
    { name: "REWIND TV", meta: REWIND_TV_META, expectedSite: "REWIND TV" },
  ];

  it.each(presets)("$name has valid title", ({ meta }) => {
    const title = meta.title as { default: string };
    expect(title.default).toBeTruthy();
    expect(title.default.length).toBeGreaterThan(10);
  });

  it.each(presets)("$name has non-empty description", ({ meta }) => {
    expect(meta.description).toBeTruthy();
    expect((meta.description as string).length).toBeGreaterThan(20);
  });

  it.each(presets)("$name has valid metadataBase URL", ({ meta }) => {
    expect(meta.metadataBase).toBeDefined();
    expect(meta.metadataBase!.toString()).toMatch(/^https:\/\//);
  });

  it.each(presets)("$name has OpenGraph configured", ({ meta }) => {
    expect(meta.openGraph).toBeDefined();
    const og = meta.openGraph! as unknown as {
      type: string;
      images: unknown;
    };
    expect(og.type).toBe("website");
    expect(og.images).toBeDefined();
  });

  it.each(presets)("$name has Twitter card configured", ({ meta }) => {
    expect(meta.twitter).toBeDefined();
    const twitter = meta.twitter! as unknown as { card: string };
    expect(twitter.card).toBe("summary_large_image");
  });

  it.each(presets)("$name has keywords", ({ meta }) => {
    expect(meta.keywords).toBeDefined();
    expect((meta.keywords as string[]).length).toBeGreaterThanOrEqual(3);
  });

  it.each(presets)("$name siteName matches expected", ({ meta, expectedSite }) => {
    const og = meta.openGraph! as unknown as { siteName: string };
    expect(og.siteName).toBe(expectedSite);
  });

  it("all presets have unique metadataBase URLs", () => {
    const urls = presets.map((p) => p.meta.metadataBase!.toString());
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("all presets allow indexing (not noIndex)", () => {
    for (const { meta } of presets) {
      const robots = meta.robots as Record<string, unknown>;
      expect(robots.index).toBe(true);
    }
  });
});
