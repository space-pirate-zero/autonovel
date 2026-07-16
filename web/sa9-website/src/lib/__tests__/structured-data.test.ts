import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  websiteJsonLd,
  productJsonLd,
  articleJsonLd,
  musicAlbumJsonLd,
  breadcrumbJsonLd,
} from "../structured-data";
import { products } from "../products";
import { albums } from "../music";

describe("organizationJsonLd", () => {
  it("returns valid Organization schema", () => {
    const result = organizationJsonLd();
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Organization");
    expect(result.name).toBe("Spaceship Alpha 9");
    expect(result.alternateName).toBe("SA9");
    expect(result.url).toBeTruthy();
    expect(result.logo).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.foundingDate).toBe("2024");
  });

  it("has founder with Person type", () => {
    const result = organizationJsonLd();
    expect(result.founder["@type"]).toBe("Person");
    expect(result.founder.name).toBe("Greg Chambers");
    expect(result.founder.alternateName).toBe("Space Pirate Zero");
    expect(result.founder.sameAs.length).toBeGreaterThan(0);
  });

  it("has address in Atlanta, GA", () => {
    const result = organizationJsonLd();
    expect(result.address.addressLocality).toBe("Atlanta");
    expect(result.address.addressRegion).toBe("GA");
    expect(result.address.addressCountry).toBe("US");
  });

  it("has social media sameAs links", () => {
    const result = organizationJsonLd();
    expect(Array.isArray(result.sameAs)).toBe(true);
    expect(result.sameAs.length).toBeGreaterThan(0);
    for (const url of result.sameAs) {
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("has numberOfEmployees as 1", () => {
    const result = organizationJsonLd();
    expect(result.numberOfEmployees.value).toBe(1);
  });
});

describe("websiteJsonLd", () => {
  it("returns valid WebSite schema", () => {
    const result = websiteJsonLd();
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("WebSite");
    expect(result.name).toBe("Spaceship Alpha 9");
    expect(result.alternateName).toBe("SA9");
    expect(result.url).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.publisher["@type"]).toBe("Organization");
  });
});

describe("productJsonLd", () => {
  it("returns valid SoftwareApplication schema for each product", () => {
    for (const product of products) {
      const result = productJsonLd(product);
      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("SoftwareApplication");
      expect(result.name).toBe(product.name);
      expect(result.description).toBe(product.heroDescription);
      expect(result.url).toContain(product.id);
      expect(result.applicationCategory).toBe("UtilitiesApplication");
      expect(result.operatingSystem).toBeTruthy();
    }
  });

  it("maps product status to schema.org availability", () => {
    const liveProduct = products.find((p) => p.status === "live");
    if (liveProduct) {
      const result = productJsonLd(liveProduct);
      expect(result.offers.availability).toBe("https://schema.org/InStock");
    }

    const betaProduct = products.find((p) => p.status === "beta");
    if (betaProduct) {
      const result = productJsonLd(betaProduct);
      expect(result.offers.availability).toBe("https://schema.org/PreOrder");
    }

    const devProduct = products.find((p) => p.status === "development");
    if (devProduct) {
      const result = productJsonLd(devProduct);
      expect(result.offers.availability).toBe("https://schema.org/PreOrder");
    }
  });

  it("includes creator organization", () => {
    const result = productJsonLd(products[0]);
    expect(result.creator["@type"]).toBe("Organization");
    expect(result.creator.name).toBe("Spaceship Alpha 9");
  });

  it("includes feature list as comma-separated string", () => {
    for (const product of products) {
      const result = productJsonLd(product);
      expect(typeof result.featureList).toBe("string");
      expect(result.featureList.length).toBeGreaterThan(0);
    }
  });

  it("sets price to 0 USD", () => {
    const result = productJsonLd(products[0]);
    expect(result.offers.price).toBe("0");
    expect(result.offers.priceCurrency).toBe("USD");
  });
});

describe("articleJsonLd", () => {
  const mockArticle = {
    title: "Test Article",
    slug: "test-article",
    description: "A test article for unit testing",
    date: "2025-01-15",
    image: "https://example.com/image.jpg",
    author: "Test Author",
    keywords: ["test", "article"],
  };

  it("returns valid Article schema", () => {
    const result = articleJsonLd(mockArticle);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Article");
    expect(result.headline).toBe("Test Article");
    expect(result.description).toBe("A test article for unit testing");
    expect(result.url).toContain("test-article");
    expect(result.datePublished).toBe("2025-01-15");
    expect(result.dateModified).toBe("2025-01-15");
  });

  it("includes image when provided", () => {
    const result = articleJsonLd(mockArticle);
    expect(result.image).toEqual(["https://example.com/image.jpg"]);
  });

  it("uses default OG image when image not provided", () => {
    const articleNoImage = { ...mockArticle };
    delete (articleNoImage as Record<string, unknown>).image;
    const result = articleJsonLd(articleNoImage);
    expect(result.image[0]).toContain("og-image.jpg");
  });

  it("includes keywords when provided", () => {
    const result = articleJsonLd(mockArticle);
    expect(result.keywords).toBe("test, article");
  });

  it("handles missing keywords", () => {
    const articleNoKeywords = { ...mockArticle };
    delete (articleNoKeywords as Record<string, unknown>).keywords;
    const result = articleJsonLd(articleNoKeywords);
    expect(result.keywords).toBe("");
  });

  it("uses custom author when provided", () => {
    const result = articleJsonLd(mockArticle);
    expect(result.author.name).toBe("Test Author");
  });

  it("defaults author to Greg Chambers", () => {
    const articleNoAuthor = { ...mockArticle };
    delete (articleNoAuthor as Record<string, unknown>).author;
    const result = articleJsonLd(articleNoAuthor);
    expect(result.author.name).toBe("Greg Chambers");
  });

  it("includes publisher organization", () => {
    const result = articleJsonLd(mockArticle);
    expect(result.publisher["@type"]).toBe("Organization");
    expect(result.publisher.name).toBe("Space Pirate Zero");
  });

  it("includes mainEntityOfPage", () => {
    const result = articleJsonLd(mockArticle);
    expect(result.mainEntityOfPage["@type"]).toBe("WebPage");
    expect(result.mainEntityOfPage["@id"]).toContain("test-article");
  });

  it("includes isPartOf blog reference", () => {
    const result = articleJsonLd(mockArticle);
    expect(result.isPartOf["@type"]).toBe("Blog");
    expect(result.isPartOf.name).toBe("Dispatches from Space Pirate Zero");
  });
});

describe("musicAlbumJsonLd", () => {
  it("returns valid MusicAlbum schema for each album", () => {
    for (const album of albums) {
      const result = musicAlbumJsonLd(album);
      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("MusicAlbum");
      expect(result.name).toBe(album.title);
      expect(result.description).toBe(album.description);
      expect(result.url).toContain(album.slug);
      expect(result.datePublished).toBe(album.date);
      expect(result.image).toBe(album.image);
    }
  });

  it("includes correct number of tracks", () => {
    for (const album of albums) {
      const result = musicAlbumJsonLd(album);
      expect(result.numTracks).toBe(album.tracks.length);
      expect(result.track.length).toBe(album.tracks.length);
    }
  });

  it("tracks have correct MusicRecording schema", () => {
    const result = musicAlbumJsonLd(albums[0]);
    for (let i = 0; i < result.track.length; i++) {
      expect(result.track[i]["@type"]).toBe("MusicRecording");
      expect(result.track[i].position).toBe(i + 1);
      expect(result.track[i].name).toBe(albums[0].tracks[i].title);
      expect(result.track[i].duration).toMatch(/^PT\d+M\d{2}S$/);
    }
  });

  it("includes byArtist as Space Pirate Zero", () => {
    const result = musicAlbumJsonLd(albums[0]);
    expect(result.byArtist["@type"]).toBe("MusicGroup");
    expect(result.byArtist.name).toBe("Space Pirate Zero");
    expect(result.byArtist.sameAs.length).toBeGreaterThan(0);
  });

  it("includes Spotify and Apple Music offers", () => {
    for (const album of albums) {
      const result = musicAlbumJsonLd(album);
      expect(result.offers).toHaveLength(2);
      expect(result.offers[0].name).toBe("Spotify");
      expect(result.offers[0].url).toBe(album.spotify);
      expect(result.offers[1].name).toBe("Apple Music");
      expect(result.offers[1].url).toBe(album.appleMusic);
    }
  });

  it("includes genre from album tags", () => {
    for (const album of albums) {
      const result = musicAlbumJsonLd(album);
      expect(result.genre).toEqual(album.tags);
    }
  });
});

describe("breadcrumbJsonLd", () => {
  it("returns valid BreadcrumbList schema", () => {
    const items = [
      { name: "Home", url: "https://spaceshipalpha9.co" },
      { name: "Products", url: "https://spaceshipalpha9.co/products" },
    ];
    const result = breadcrumbJsonLd(items);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
  });

  it("assigns correct positions starting from 1", () => {
    const items = [
      { name: "Home", url: "https://spaceshipalpha9.co" },
      { name: "Products", url: "https://spaceshipalpha9.co/products" },
      { name: "StyleLift", url: "https://spaceshipalpha9.co/products/stylelift" },
    ];
    const result = breadcrumbJsonLd(items);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
    expect(result.itemListElement[2].position).toBe(3);
  });

  it("maps names and URLs correctly", () => {
    const items = [{ name: "Home", url: "https://spaceshipalpha9.co" }];
    const result = breadcrumbJsonLd(items);
    expect(result.itemListElement[0].name).toBe("Home");
    expect(result.itemListElement[0].item).toBe("https://spaceshipalpha9.co");
    expect(result.itemListElement[0]["@type"]).toBe("ListItem");
  });

  it("handles empty array", () => {
    const result = breadcrumbJsonLd([]);
    expect(result.itemListElement).toHaveLength(0);
  });

  it("handles single item", () => {
    const result = breadcrumbJsonLd([
      { name: "Home", url: "https://spaceshipalpha9.co" },
    ]);
    expect(result.itemListElement).toHaveLength(1);
    expect(result.itemListElement[0].position).toBe(1);
  });
});
