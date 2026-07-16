import { describe, it, expect } from "vitest";
import {
  products,
  getProductById,
  getProductsByDesignSystem,
  getProductsByType,
  getProductsByStatus,
} from "../products";

describe("products", () => {
  it("contains all 16 SA9 products (including SPZ flagship)", () => {
    expect(products).toHaveLength(16);
  });

  it("every product has required fields", () => {
    for (const product of products) {
      expect(product.id).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.tagline).toBeTruthy();
      expect(product.description).toBeTruthy();
      expect(product.heroDescription).toBeTruthy();
      expect(product.pressQuote).toBeTruthy();
      expect(product.type).toBeTruthy();
      expect(product.designSystem).toBeTruthy();
      expect(product.stack.length).toBeGreaterThan(0);
      expect(product.status).toBeTruthy();
      expect(product.subdomain).toBeTruthy();
      expect(product.domain).toBeTruthy();
      expect(product.icon).toBeTruthy();
      expect(product.color).toBeTruthy();
      expect(product.features.length).toBeGreaterThan(0);
      expect(product.platforms.length).toBeGreaterThan(0);
    }
  });

  it("every product has a unique id", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every product has a unique subdomain", () => {
    const subdomains = products.map((p) => p.subdomain);
    expect(new Set(subdomains).size).toBe(subdomains.length);
  });

  it("every product has a unique domain", () => {
    const domains = products.map((p) => p.domain);
    expect(new Set(domains).size).toBe(domains.length);
  });
});

describe("getProductById", () => {
  it("returns correct product by id", () => {
    const product = getProductById("darkwave");
    expect(product).toBeDefined();
    expect(product?.name).toBe("DARKWAVE");
    expect(product?.designSystem).toBe("phosphor");
    expect(product?.domain).toBe("darkwave.dev");
  });

  it("returns undefined for unknown id", () => {
    expect(getProductById("nonexistent")).toBeUndefined();
  });
});

describe("getProductsByDesignSystem", () => {
  it("returns products for NEON system", () => {
    const neonProducts = getProductsByDesignSystem("neon");
    expect(neonProducts.length).toBeGreaterThan(0);
    for (const product of neonProducts) {
      expect(product.designSystem).toBe("neon");
    }
  });

  it("returns products for PHOSPHOR system", () => {
    const phosphorProducts = getProductsByDesignSystem("phosphor");
    expect(phosphorProducts).toHaveLength(1);
    expect(phosphorProducts[0].id).toBe("darkwave");
  });

  it("returns products for LEOPARD system", () => {
    const leopardProducts = getProductsByDesignSystem("leopard");
    expect(leopardProducts).toHaveLength(1);
    expect(leopardProducts[0].id).toBe("stylelift");
  });

  it("returns products for STEALTH system", () => {
    const stealthProducts = getProductsByDesignSystem("stealth");
    expect(stealthProducts).toHaveLength(2);
    const ids = stealthProducts.map((p) => p.id);
    expect(ids).toContain("ghostdeck");
    expect(ids).toContain("ghostgrid");
  });
});

describe("getProductsByType", () => {
  it("returns platform products", () => {
    const platforms = getProductsByType("platform");
    expect(platforms.length).toBeGreaterThan(0);
    for (const product of platforms) {
      expect(product.type).toBe("platform");
    }
  });

  it("returns consumer products", () => {
    const consumers = getProductsByType("consumer");
    expect(consumers.length).toBeGreaterThan(0);
  });
});

describe("getProductsByStatus", () => {
  it("returns products by status", () => {
    const beta = getProductsByStatus("beta");
    expect(beta.length).toBeGreaterThan(0);
    for (const product of beta) {
      expect(product.status).toBe("beta");
    }
  });
});
