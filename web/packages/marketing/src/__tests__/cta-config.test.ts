import { describe, it, expect } from "vitest";
import { CTA_CONFIG, getCTA } from "../cta/cta-config";
import type { ProductCTA, CTAAction } from "../cta/cta-config";

// ─── getCTA ─────────────────────────────────────────────────────────────

describe("getCTA", () => {
  it("returns ProductCTA for known product", () => {
    const result = getCTA("stylelift");
    expect(result).toBeDefined();
    expect(result!.product).toBe("StyleLift");
  });

  it("returns undefined for unknown product", () => {
    expect(getCTA("nonexistent-product")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getCTA("")).toBeUndefined();
  });
});

// ─── CTA_CONFIG completeness ────────────────────────────────────────────

describe("CTA_CONFIG", () => {
  const expectedProducts = [
    "sa9-website",
    "spz",
    "stylelift",
    "tradecraft",
    "darkwave-web",
    "ghostdeck-web",
    "countryplus",
  ];

  it("contains all expected product entries", () => {
    for (const product of expectedProducts) {
      expect(CTA_CONFIG[product]).toBeDefined();
    }
  });

  it("has no extra unexpected entries", () => {
    const keys = Object.keys(CTA_CONFIG);
    expect(keys.sort()).toEqual(expectedProducts.sort());
  });
});

// ─── CTA structure validation ───────────────────────────────────────────

describe("CTA structure validation", () => {
  function assertValidAction(action: CTAAction, context: string) {
    expect(action.label, `${context}: label should be non-empty`).toBeTruthy();
    expect(action.href, `${context}: href should start with /`).toMatch(/^\//);
    expect(action.event, `${context}: event should match naming convention`).toMatch(
      /^marketing\.\w+$/
    );
  }

  it.each(Object.entries(CTA_CONFIG))(
    "%s has valid primary action",
    (_key, cta: ProductCTA) => {
      expect(cta.primary).toBeDefined();
      assertValidAction(cta.primary, `${_key}.primary`);
    }
  );

  it.each(Object.entries(CTA_CONFIG))(
    "%s has non-empty product name",
    (_key, cta: ProductCTA) => {
      expect(cta.product).toBeTruthy();
      expect(cta.product.length).toBeGreaterThan(0);
    }
  );

  it.each(
    Object.entries(CTA_CONFIG).filter(([, cta]) => cta.secondary)
  )(
    "%s secondary action is valid",
    (_key, cta: ProductCTA) => {
      assertValidAction(cta.secondary!, `${_key}.secondary`);
    }
  );

  it.each(
    Object.entries(CTA_CONFIG).filter(([, cta]) => cta.waitlist)
  )(
    "%s waitlist action is valid",
    (_key, cta: ProductCTA) => {
      assertValidAction(cta.waitlist!, `${_key}.waitlist`);
    }
  );

  it("all action variants are valid enum values", () => {
    const validVariants = new Set(["primary", "secondary", "ghost"]);
    for (const [key, cta] of Object.entries(CTA_CONFIG)) {
      if (cta.primary.variant) {
        expect(validVariants.has(cta.primary.variant), `${key}.primary.variant`).toBe(true);
      }
      if (cta.secondary?.variant) {
        expect(validVariants.has(cta.secondary.variant), `${key}.secondary.variant`).toBe(true);
      }
    }
  });

  it("all event names follow marketing.* convention", () => {
    for (const [, cta] of Object.entries(CTA_CONFIG)) {
      expect(cta.primary.event).toMatch(/^marketing\./);
      if (cta.secondary) expect(cta.secondary.event).toMatch(/^marketing\./);
      if (cta.waitlist) expect(cta.waitlist.event).toMatch(/^marketing\./);
    }
  });

  it("waitlist events use waitlistJoined naming", () => {
    for (const [, cta] of Object.entries(CTA_CONFIG)) {
      if (cta.waitlist) {
        expect(cta.waitlist.event).toBe("marketing.waitlistJoined");
      }
    }
  });

  it("no duplicate hrefs within the same product", () => {
    for (const [key, cta] of Object.entries(CTA_CONFIG)) {
      const hrefs = [cta.primary.href, cta.secondary?.href, cta.waitlist?.href].filter(Boolean);
      const unique = new Set(hrefs);
      expect(unique.size, `${key} has duplicate hrefs`).toBe(hrefs.length);
    }
  });
});
