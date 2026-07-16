import { describe, it, expect } from "vitest";
import { videos, pressItems, patents, book } from "../press";

describe("videos", () => {
  it("returns a non-empty array", () => {
    expect(videos).toBeDefined();
    expect(Array.isArray(videos)).toBe(true);
    expect(videos.length).toBeGreaterThan(0);
  });

  it("every video has required fields", () => {
    for (const video of videos) {
      expect(video.id).toBeDefined();
      expect(typeof video.id).toBe("number");
      expect(video.type).toBe("video");
      expect(video.title).toBeTruthy();
      expect(video.url).toBeTruthy();
      expect(video.date).toBeTruthy();
      expect(video.image).toBeTruthy();
      expect(video.description).toBeTruthy();
      expect(video.summary).toBeTruthy();
      expect(Array.isArray(video.tags)).toBe(true);
      expect(video.tags.length).toBeGreaterThan(0);
    }
  });

  it("every video has a youtubeId", () => {
    for (const video of videos) {
      expect(video.youtubeId).toBeTruthy();
      expect(typeof video.youtubeId).toBe("string");
    }
  });

  it("every video URL is a valid YouTube URL", () => {
    for (const video of videos) {
      expect(video.url).toMatch(/youtube\.com/);
    }
  });

  it("every video date is valid ISO date", () => {
    for (const video of videos) {
      expect(video.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(video.date).getTime()).not.toBeNaN();
    }
  });

  it("every video has a unique id", () => {
    const ids = videos.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("pressItems", () => {
  it("returns a non-empty array", () => {
    expect(pressItems).toBeDefined();
    expect(Array.isArray(pressItems)).toBe(true);
    expect(pressItems.length).toBeGreaterThan(0);
  });

  it("every press item has required fields", () => {
    for (const item of pressItems) {
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe("number");
      expect(item.type).toBe("press");
      expect(item.title).toBeTruthy();
      expect(item.url).toBeTruthy();
      expect(item.date).toBeTruthy();
      expect(item.image).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.summary).toBeTruthy();
      expect(Array.isArray(item.tags)).toBe(true);
      expect(item.tags.length).toBeGreaterThan(0);
    }
  });

  it("every press item URL is a valid URL", () => {
    for (const item of pressItems) {
      expect(() => new URL(item.url)).not.toThrow();
    }
  });

  it("every press item has a unique id", () => {
    const ids = pressItems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every press item date is valid", () => {
    for (const item of pressItems) {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(item.date).getTime()).not.toBeNaN();
    }
  });

  it("summary is longer than description for each item", () => {
    for (const item of pressItems) {
      expect(item.summary.length).toBeGreaterThan(item.description.length);
    }
  });
});

describe("patents", () => {
  it("returns a non-empty array", () => {
    expect(patents).toBeDefined();
    expect(Array.isArray(patents)).toBe(true);
    expect(patents.length).toBeGreaterThan(0);
  });

  it("every patent has required fields", () => {
    for (const patent of patents) {
      expect(patent.id).toBeDefined();
      expect(typeof patent.id).toBe("number");
      expect(patent.type).toBe("patent");
      expect(patent.title).toBeTruthy();
      expect(patent.url).toBeTruthy();
      expect(patent.date).toBeTruthy();
      expect(patent.image).toBeTruthy();
      expect(patent.description).toBeTruthy();
      expect(patent.summary).toBeTruthy();
      expect(Array.isArray(patent.tags)).toBe(true);
    }
  });

  it("every patent URL points to Justia", () => {
    for (const patent of patents) {
      expect(patent.url).toMatch(/patents\.justia\.com/);
    }
  });

  it("every patent has a unique id", () => {
    const ids = patents.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("book", () => {
  it("has required fields", () => {
    expect(book.title).toBeTruthy();
    expect(book.status).toBeTruthy();
    expect(book.description).toBeTruthy();
    expect(book.summary).toBeTruthy();
    expect(book.image).toBeTruthy();
    expect(Array.isArray(book.tags)).toBe(true);
    expect(book.tags.length).toBeGreaterThan(0);
  });

  it("has the correct title", () => {
    expect(book.title).toBe("Digital Insurgency");
  });

  it("tags include key topics", () => {
    expect(book.tags).toContain("Digital Insurgency");
    expect(book.tags).toContain("Trojan Horse Protocol");
  });
});

describe("cross-collection uniqueness", () => {
  it("all press-related ids are unique across videos, press, and patents", () => {
    const allIds = [
      ...videos.map((v) => v.id),
      ...pressItems.map((p) => p.id),
      ...patents.map((p) => p.id),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
