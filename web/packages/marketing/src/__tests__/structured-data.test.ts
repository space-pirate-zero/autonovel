import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  websiteJsonLd,
  softwareAppJsonLd,
  articleJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  personJsonLd,
  videoObjectJsonLd,
} from "../seo/structured-data";

// ─── Helpers ────────────────────────────────────────────────────────────

function assertValidJsonLd(obj: Record<string, unknown>) {
  expect(obj["@context"]).toBe("https://schema.org");
  expect(obj["@type"]).toBeDefined();
  expect(typeof obj["@type"]).toBe("string");
  // Must be valid JSON (no circular refs, no undefined values)
  expect(() => JSON.stringify(obj)).not.toThrow();
  const parsed = JSON.parse(JSON.stringify(obj));
  expect(parsed).toEqual(obj);
}

// ─── organizationJsonLd ─────────────────────────────────────────────────

describe("organizationJsonLd", () => {
  it("returns valid JSON-LD with default base URL", () => {
    const result = organizationJsonLd();
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("Organization");
    expect(result.name).toBe("Spaceship Alpha 9");
    expect(result.url).toBe("https://spaceshipalpha9.co");
  });

  it("uses custom base URL for url and logo", () => {
    const result = organizationJsonLd("https://custom.example.com");
    expect(result.url).toBe("https://custom.example.com");
    expect(result.logo).toBe("https://custom.example.com/logo.png");
  });

  it("includes founder with correct Person schema", () => {
    const result = organizationJsonLd();
    const founder = result.founder as Record<string, unknown>;
    expect(founder["@type"]).toBe("Person");
    expect(founder.name).toBe("Greg Chambers");
    expect(founder.alternateName).toBe("Space Pirate Zero");
    expect(founder.jobTitle).toBe("Founder & Captain");
  });

  it("includes social profiles in sameAs", () => {
    const result = organizationJsonLd();
    const sameAs = result.sameAs as string[];
    expect(sameAs.length).toBeGreaterThanOrEqual(3);
    expect(sameAs.every((url) => url.startsWith("https://"))).toBe(true);
  });

  it("includes Atlanta, GA address", () => {
    const result = organizationJsonLd();
    const address = result.address as Record<string, unknown>;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.addressLocality).toBe("Atlanta");
    expect(address.addressRegion).toBe("GA");
  });

  it("includes founding date", () => {
    const result = organizationJsonLd();
    expect(result.foundingDate).toBe("2024");
  });
});

// ─── websiteJsonLd ──────────────────────────────────────────────────────

describe("websiteJsonLd", () => {
  it("returns valid JSON-LD", () => {
    const result = websiteJsonLd({
      name: "Test Site",
      url: "https://test.com",
      description: "A test site",
    });
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("WebSite");
  });

  it("includes all provided fields", () => {
    const result = websiteJsonLd({
      name: "StyleLift",
      url: "https://stylelift.fashion",
      description: "AI wardrobe intelligence",
    });
    expect(result.name).toBe("StyleLift");
    expect(result.url).toBe("https://stylelift.fashion");
    expect(result.description).toBe("AI wardrobe intelligence");
  });

  it("always includes SA9 as publisher", () => {
    const result = websiteJsonLd({
      name: "Any Site",
      url: "https://any.com",
      description: "Anything",
    });
    const publisher = result.publisher as Record<string, unknown>;
    expect(publisher["@type"]).toBe("Organization");
    expect(publisher.name).toBe("Spaceship Alpha 9");
  });

  it("handles empty strings without throwing", () => {
    const result = websiteJsonLd({ name: "", url: "", description: "" });
    assertValidJsonLd(result);
    expect(result.name).toBe("");
  });
});

// ─── softwareAppJsonLd ──────────────────────────────────────────────────

describe("softwareAppJsonLd", () => {
  const baseApp = {
    name: "TestApp",
    description: "Test description",
    url: "https://test.com",
  };

  it("returns valid JSON-LD", () => {
    const result = softwareAppJsonLd(baseApp);
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("SoftwareApplication");
  });

  it("defaults category to UtilitiesApplication", () => {
    const result = softwareAppJsonLd(baseApp);
    expect(result.applicationCategory).toBe("UtilitiesApplication");
  });

  it("uses custom category when provided", () => {
    const result = softwareAppJsonLd({ ...baseApp, category: "GameApplication" });
    expect(result.applicationCategory).toBe("GameApplication");
  });

  it.each(["live", "beta", "development", "waitlist"] as const)(
    "maps status '%s' to correct schema.org availability",
    (status) => {
      const result = softwareAppJsonLd({ ...baseApp, status });
      const offers = result.offers as Record<string, unknown>;
      expect(offers.availability).toMatch(/^https:\/\/schema\.org\/(InStock|PreOrder)$/);
    }
  );

  it("maps 'live' status to InStock", () => {
    const result = softwareAppJsonLd({ ...baseApp, status: "live" });
    const offers = result.offers as Record<string, unknown>;
    expect(offers.availability).toBe("https://schema.org/InStock");
  });

  it("maps non-live statuses to PreOrder", () => {
    for (const status of ["beta", "development", "waitlist"] as const) {
      const result = softwareAppJsonLd({ ...baseApp, status });
      const offers = result.offers as Record<string, unknown>;
      expect(offers.availability).toBe("https://schema.org/PreOrder");
    }
  });

  it("includes platforms in operatingSystem when provided", () => {
    const result = softwareAppJsonLd({ ...baseApp, platforms: ["iOS", "macOS"] });
    expect(result.operatingSystem).toBe("iOS, macOS");
  });

  it("omits operatingSystem when platforms not provided", () => {
    const result = softwareAppJsonLd(baseApp);
    expect(result).not.toHaveProperty("operatingSystem");
  });

  it("price is always 0 USD", () => {
    const result = softwareAppJsonLd(baseApp);
    const offers = result.offers as Record<string, unknown>;
    expect(offers.price).toBe("0");
    expect(offers.priceCurrency).toBe("USD");
  });

  it("includes SA9 as creator", () => {
    const result = softwareAppJsonLd(baseApp);
    const creator = result.creator as Record<string, unknown>;
    expect(creator["@type"]).toBe("Organization");
    expect(creator.name).toBe("Spaceship Alpha 9");
  });
});

// ─── articleJsonLd ──────────────────────────────────────────────────────

describe("articleJsonLd", () => {
  const baseArticle = {
    title: "Test Article",
    slug: "test-article",
    description: "A test article",
    baseUrl: "https://spaceshipalpha9.co",
    date: "2026-04-13T00:00:00Z",
  };

  it("returns valid JSON-LD", () => {
    const result = articleJsonLd(baseArticle);
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("Article");
  });

  it("constructs url from baseUrl + /dispatches/ + slug", () => {
    const result = articleJsonLd(baseArticle);
    expect(result.url).toBe("https://spaceshipalpha9.co/dispatches/test-article");
  });

  it("uses provided image when available", () => {
    const result = articleJsonLd({ ...baseArticle, image: "https://cdn.example.com/img.jpg" });
    expect(result.image).toEqual(["https://cdn.example.com/img.jpg"]);
  });

  it("falls back to og-image.jpg when no image provided", () => {
    const result = articleJsonLd(baseArticle);
    expect(result.image).toEqual(["https://spaceshipalpha9.co/og-image.jpg"]);
  });

  it("uses custom author when provided", () => {
    const result = articleJsonLd({ ...baseArticle, author: "Jane Doe" });
    const author = result.author as Record<string, unknown>;
    expect(author.name).toBe("Jane Doe");
  });

  it("defaults author to Greg Chambers", () => {
    const result = articleJsonLd(baseArticle);
    const author = result.author as Record<string, unknown>;
    expect(author.name).toBe("Greg Chambers");
    expect(author.alternateName).toBe("Space Pirate Zero");
  });

  it("joins keywords with comma", () => {
    const result = articleJsonLd({ ...baseArticle, keywords: ["ai", "marketing", "tools"] });
    expect(result.keywords).toBe("ai, marketing, tools");
  });

  it("defaults keywords to empty string", () => {
    const result = articleJsonLd(baseArticle);
    expect(result.keywords).toBe("");
  });

  it("sets both datePublished and dateModified", () => {
    const result = articleJsonLd(baseArticle);
    expect(result.datePublished).toBe("2026-04-13T00:00:00Z");
    expect(result.dateModified).toBe("2026-04-13T00:00:00Z");
  });
});

// ─── faqPageJsonLd ──────────────────────────────────────────────────────

describe("faqPageJsonLd", () => {
  it("returns valid JSON-LD with FAQPage type", () => {
    const result = faqPageJsonLd([{ q: "What?", a: "That." }]);
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("FAQPage");
  });

  it("maps q/a pairs to Question/Answer entities", () => {
    const result = faqPageJsonLd([
      { q: "What is SA9?", a: "A software studio." },
      { q: "How many products?", a: "15" },
    ]);
    const entities = result.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[0].name).toBe("What is SA9?");
    const answer = entities[0].acceptedAnswer as Record<string, unknown>;
    expect(answer["@type"]).toBe("Answer");
    expect(answer.text).toBe("A software studio.");
  });

  it("handles empty FAQ array", () => {
    const result = faqPageJsonLd([]);
    assertValidJsonLd(result);
    expect(result.mainEntity).toEqual([]);
  });

  it("preserves special characters in questions and answers", () => {
    const result = faqPageJsonLd([{ q: 'What about "quotes" & <tags>?', a: "It's fine." }]);
    const entities = result.mainEntity as Array<Record<string, unknown>>;
    expect(entities[0].name).toBe('What about "quotes" & <tags>?');
  });
});

// ─── breadcrumbJsonLd ───────────────────────────────────────────────────

describe("breadcrumbJsonLd", () => {
  it("returns valid JSON-LD with BreadcrumbList type", () => {
    const result = breadcrumbJsonLd([{ name: "Home", url: "https://sa9.co" }]);
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("BreadcrumbList");
  });

  it("assigns 1-indexed positions", () => {
    const result = breadcrumbJsonLd([
      { name: "Home", url: "https://sa9.co" },
      { name: "Products", url: "https://sa9.co/products" },
      { name: "StyleLift", url: "https://sa9.co/products/stylelift" },
    ]);
    const items = result.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
    expect(items[2].position).toBe(3);
    expect(items[2].name).toBe("StyleLift");
  });

  it("uses ListItem type for each entry", () => {
    const result = breadcrumbJsonLd([{ name: "Home", url: "/" }]);
    const items = result.itemListElement as Array<Record<string, unknown>>;
    expect(items[0]["@type"]).toBe("ListItem");
  });

  it("handles empty breadcrumbs", () => {
    const result = breadcrumbJsonLd([]);
    assertValidJsonLd(result);
    expect(result.itemListElement).toEqual([]);
  });
});

// ─── personJsonLd ───────────────────────────────────────────────────────

describe("personJsonLd", () => {
  const basePerson = {
    name: "Greg Chambers",
    jobTitle: "Founder & Captain",
    description: "Builder of SA9",
    url: "https://spacepiratezero.com",
  };

  it("returns valid JSON-LD with Person type", () => {
    const result = personJsonLd(basePerson);
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("Person");
  });

  it("includes optional alternateName", () => {
    const result = personJsonLd({ ...basePerson, alternateName: "Space Pirate Zero" });
    expect(result.alternateName).toBe("Space Pirate Zero");
  });

  it("omits alternateName when not provided", () => {
    const result = personJsonLd(basePerson);
    expect(result).not.toHaveProperty("alternateName");
  });

  it("includes optional image", () => {
    const result = personJsonLd({ ...basePerson, image: "https://cdn.example.com/greg.jpg" });
    expect(result.image).toBe("https://cdn.example.com/greg.jpg");
  });

  it("omits image when not provided", () => {
    const result = personJsonLd(basePerson);
    expect(result).not.toHaveProperty("image");
  });

  it("includes sameAs array when provided", () => {
    const result = personJsonLd({ ...basePerson, sameAs: ["https://twitter.com/spz", "https://github.com/spz"] });
    expect(result.sameAs).toEqual(["https://twitter.com/spz", "https://github.com/spz"]);
  });

  it("always includes worksFor SA9", () => {
    const result = personJsonLd(basePerson);
    const worksFor = result.worksFor as Record<string, unknown>;
    expect(worksFor["@type"]).toBe("Organization");
    expect(worksFor.name).toBe("Spaceship Alpha 9");
  });
});

// ─── videoObjectJsonLd ──────────────────────────────────────────────────

describe("videoObjectJsonLd", () => {
  const baseVideo = {
    title: "SA9 Launch Video",
    description: "Watch the launch",
    youtubeId: "dQw4w9WgXcQ",
    date: "2026-04-01",
  };

  it("returns valid JSON-LD with VideoObject type", () => {
    const result = videoObjectJsonLd(baseVideo);
    assertValidJsonLd(result);
    expect(result["@type"]).toBe("VideoObject");
  });

  it("constructs YouTube thumbnail URL from ID", () => {
    const result = videoObjectJsonLd(baseVideo);
    expect(result.thumbnailUrl).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg");
  });

  it("constructs contentUrl and embedUrl from ID", () => {
    const result = videoObjectJsonLd(baseVideo);
    expect(result.contentUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(result.embedUrl).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
  });

  it("includes optional duration", () => {
    const result = videoObjectJsonLd({ ...baseVideo, duration: "PT5M30S" });
    expect(result.duration).toBe("PT5M30S");
  });

  it("omits duration when not provided", () => {
    const result = videoObjectJsonLd(baseVideo);
    expect(result).not.toHaveProperty("duration");
  });
});
