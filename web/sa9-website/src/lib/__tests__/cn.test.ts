import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe("base active");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });

  it("merges tailwind conflicts correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles empty string arguments", () => {
    expect(cn("base", "", "active")).toBe("base active");
  });

  it("handles no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles single argument", () => {
    expect(cn("solo")).toBe("solo");
  });

  it("handles arrays of class names", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles nested arrays", () => {
    expect(cn(["foo", ["bar", "baz"]])).toBe("foo bar baz");
  });

  it("handles object syntax", () => {
    expect(cn({ active: true, hidden: false })).toBe("active");
  });

  it("handles mixed arguments", () => {
    expect(cn("base", { active: true }, ["extra"])).toBe("base active extra");
  });

  it("preserves duplicate non-tailwind classes", () => {
    // tailwind-merge only deduplicates tailwind utility conflicts, not arbitrary classes
    expect(cn("foo", "foo")).toBe("foo foo");
  });

  it("resolves tailwind margin conflicts", () => {
    expect(cn("mt-2", "mt-4")).toBe("mt-4");
  });

  it("resolves tailwind padding conflicts", () => {
    expect(cn("p-2", "p-8")).toBe("p-8");
  });

  it("resolves tailwind color conflicts", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("preserves non-conflicting classes", () => {
    expect(cn("mt-2", "px-4", "text-sm")).toBe("mt-2 px-4 text-sm");
  });

  it("handles boolean false values", () => {
    expect(cn("base", false, "active")).toBe("base active");
  });

  it("handles number 0 correctly", () => {
    expect(cn("base", 0, "active")).toBe("base active");
  });
});
