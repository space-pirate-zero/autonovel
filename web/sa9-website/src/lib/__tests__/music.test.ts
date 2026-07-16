import { describe, it, expect } from "vitest";
import { albums } from "../music";

describe("albums", () => {
  it("returns a non-empty array of albums", () => {
    expect(albums).toBeDefined();
    expect(Array.isArray(albums)).toBe(true);
    expect(albums.length).toBeGreaterThan(0);
  });

  it("every album has required fields", () => {
    for (const album of albums) {
      expect(album.id).toBeTruthy();
      expect(album.title).toBeTruthy();
      expect(album.slug).toBeTruthy();
      expect(album.spotify).toBeTruthy();
      expect(album.appleMusic).toBeTruthy();
      expect(album.appleMusicEmbed).toBeTruthy();
      expect(album.date).toBeTruthy();
      expect(album.image).toBeTruthy();
      expect(album.description).toBeTruthy();
      expect(Array.isArray(album.tags)).toBe(true);
      expect(album.tags.length).toBeGreaterThan(0);
      expect(Array.isArray(album.tracks)).toBe(true);
      expect(album.tracks.length).toBeGreaterThan(0);
    }
  });

  it("every album has a unique id", () => {
    const ids = albums.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every album has a unique slug", () => {
    const slugs = albums.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every album slug is URL-safe", () => {
    for (const album of albums) {
      expect(album.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("every album date is a valid ISO date", () => {
    for (const album of albums) {
      expect(album.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const parsed = new Date(album.date);
      expect(parsed.getTime()).not.toBeNaN();
    }
  });

  it("every album Spotify URL is a valid Spotify link", () => {
    for (const album of albums) {
      expect(album.spotify).toMatch(/^https:\/\/open\.spotify\.com\/album\//);
    }
  });

  it("every album Apple Music URL is a valid Apple Music link", () => {
    for (const album of albums) {
      expect(album.appleMusic).toMatch(/^https:\/\/music\.apple\.com\//);
    }
  });

  it("every album Apple Music embed URL is a valid embed link", () => {
    for (const album of albums) {
      expect(album.appleMusicEmbed).toMatch(
        /^https:\/\/embed\.music\.apple\.com\//
      );
    }
  });

  it("every album image URL is a valid URL", () => {
    for (const album of albums) {
      expect(() => new URL(album.image)).not.toThrow();
    }
  });

  it("optional youtube field is a valid URL when present", () => {
    for (const album of albums) {
      if (album.youtube) {
        expect(() => new URL(album.youtube!)).not.toThrow();
      }
    }
  });

  it("every track has title and duration", () => {
    for (const album of albums) {
      for (const track of album.tracks) {
        expect(track.title).toBeTruthy();
        expect(track.duration).toBeTruthy();
      }
    }
  });

  it("every track duration is in M:SS format", () => {
    for (const album of albums) {
      for (const track of album.tracks) {
        expect(track.duration).toMatch(/^\d+:\d{2}$/);
      }
    }
  });

  it("tags are non-empty strings", () => {
    for (const album of albums) {
      for (const tag of album.tags) {
        expect(typeof tag).toBe("string");
        expect(tag.length).toBeGreaterThan(0);
      }
    }
  });

  it("every album has a valid date", () => {
    for (const album of albums) {
      const parsed = new Date(album.date);
      expect(parsed.getTime()).not.toBeNaN();
      // Dates should be in the past or near future
      expect(parsed.getFullYear()).toBeGreaterThanOrEqual(2020);
      expect(parsed.getFullYear()).toBeLessThanOrEqual(2030);
    }
  });
});
