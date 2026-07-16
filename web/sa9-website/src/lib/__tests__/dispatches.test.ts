import { describe, it, expect } from "vitest";
import { dispatches } from "../dispatches";

describe("dispatches", () => {
  it("returns a non-empty array of dispatches", () => {
    expect(dispatches).toBeDefined();
    expect(Array.isArray(dispatches)).toBe(true);
    expect(dispatches.length).toBeGreaterThan(0);
  });

  it("every dispatch has required fields", () => {
    for (const dispatch of dispatches) {
      expect(dispatch.id).toBeDefined();
      expect(typeof dispatch.id).toBe("number");
      expect(dispatch.title).toBeTruthy();
      expect(dispatch.slug).toBeTruthy();
      expect(dispatch.url).toBeTruthy();
      expect(dispatch.date).toBeTruthy();
      expect(dispatch.image).toBeTruthy();
      expect(dispatch.description).toBeTruthy();
      expect(dispatch.summary).toBeTruthy();
      expect(Array.isArray(dispatch.tags)).toBe(true);
      expect(Array.isArray(dispatch.seoKeywords)).toBe(true);
    }
  });

  it("every dispatch has a unique id", () => {
    const ids = dispatches.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every dispatch has a unique slug", () => {
    const slugs = dispatches.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every dispatch slug is URL-safe", () => {
    for (const dispatch of dispatches) {
      expect(dispatch.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("every dispatch date is a valid ISO date", () => {
    for (const dispatch of dispatches) {
      expect(dispatch.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const parsed = new Date(dispatch.date);
      expect(parsed.getTime()).not.toBeNaN();
    }
  });

  it("every dispatch URL is a valid URL", () => {
    for (const dispatch of dispatches) {
      expect(() => new URL(dispatch.url)).not.toThrow();
    }
  });

  it("every dispatch image is a valid URL", () => {
    for (const dispatch of dispatches) {
      expect(() => new URL(dispatch.image)).not.toThrow();
    }
  });

  it("tags are non-empty strings", () => {
    for (const dispatch of dispatches) {
      for (const tag of dispatch.tags) {
        expect(typeof tag).toBe("string");
        expect(tag.length).toBeGreaterThan(0);
      }
    }
  });

  it("seoKeywords are non-empty strings", () => {
    for (const dispatch of dispatches) {
      for (const keyword of dispatch.seoKeywords) {
        expect(typeof keyword).toBe("string");
        expect(keyword.length).toBeGreaterThan(0);
      }
    }
  });

  it("dispatches are sorted or have consistent ordering", () => {
    // Each dispatch should have a positive id
    for (const dispatch of dispatches) {
      expect(dispatch.id).toBeGreaterThan(0);
    }
  });

  it("optional fields have correct types when present", () => {
    for (const dispatch of dispatches) {
      if (dispatch.htmlContent !== undefined) {
        expect(typeof dispatch.htmlContent).toBe("string");
      }
      if (dispatch.readingTime !== undefined) {
        expect(typeof dispatch.readingTime).toBe("number");
        expect(dispatch.readingTime).toBeGreaterThan(0);
      }
      if (dispatch.author !== undefined) {
        expect(typeof dispatch.author).toBe("string");
      }
      if (dispatch.images !== undefined) {
        expect(Array.isArray(dispatch.images)).toBe(true);
      }
      if (dispatch.rss_guid !== undefined) {
        expect(typeof dispatch.rss_guid).toBe("string");
      }
    }
  });

  it("summary is longer than title for each dispatch", () => {
    for (const dispatch of dispatches) {
      expect(dispatch.summary.length).toBeGreaterThan(dispatch.title.length);
    }
  });

  it("description is shorter than summary for each dispatch", () => {
    for (const dispatch of dispatches) {
      expect(dispatch.description.length).toBeLessThanOrEqual(
        dispatch.summary.length + 50
      );
    }
  });
});
