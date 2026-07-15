import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../../app/api/health/all/route";

// ─── Mock fetch for cluster-internal health checks ──────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockSiteHealth(name: string, status = "ok") {
  return { status: "fulfilled", value: { name, status, timestamp: Date.now() } };
}

function mockSiteUnreachable(name: string) {
  return { status: "fulfilled", value: { name, status: "unreachable" } };
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe("GET /api/health/all", () => {
  it("returns a Response object", async () => {
    // Mock all sites healthy
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok", timestamp: Date.now() }),
    });
    const response = await GET();
    expect(response).toBeInstanceOf(Response);
  });

  it("returns 200 when all sites are healthy", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok", timestamp: Date.now() }),
    });
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("returns 503 when any site is unhealthy", async () => {
    // First call succeeds, subsequent calls fail
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount <= 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: "ok" }),
        });
      }
      return Promise.reject(new Error("Connection refused"));
    });
    const response = await GET();
    expect(response.status).toBe(503);
  });

  it("response includes status field", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    expect(["ok", "degraded"]).toContain(data.status);
  });

  it("response includes timestamp", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    expect(typeof data.timestamp).toBe("number");
  });

  it("response includes sites array", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    expect(Array.isArray(data.sites)).toBe(true);
    expect(data.sites.length).toBeGreaterThan(0);
  });

  it("each site entry has name and status", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    for (const site of data.sites) {
      expect(site.name).toBeDefined();
      expect(site.status).toBeDefined();
    }
  });

  it("checks all 8 SA9 marketing sites", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    // The SITES constant has 8 entries
    expect(data.sites.length).toBe(8);
  });

  it("handles individual site timeouts gracefully", async () => {
    // Simulate one site timing out
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 3) {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 100);
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" }),
      });
    });
    // Should not throw
    const response = await GET();
    expect(response).toBeInstanceOf(Response);
  });

  it("marks network failures as unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));
    const response = await GET();
    const data = await response.json();
    for (const site of data.sites) {
      expect(site.status).toBe("unreachable");
    }
  });

  it("all-healthy returns status 'ok'", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe("ok");
  });

  it("any-unhealthy returns status 'degraded'", async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error("Down"));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" }),
      });
    });
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe("degraded");
  });
});

// ─── Site inventory contract ────────────────────────────────────────────

describe("health check site inventory", () => {
  const expectedSites = [
    "sa9-website",
    "spz",
    "tradecraft",
    "darkwave",
    "ghostdeck",
    "stylelift-web",
    "stylelift-marketing",
    "countryplus",
  ];

  it("checks all expected sites", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    const response = await GET();
    const data = await response.json();
    const siteNames = data.sites.map((s: { name: string }) => s.name);

    for (const expected of expectedSites) {
      expect(siteNames).toContain(expected);
    }
  });

  it("uses cluster-internal DNS for health checks", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    await GET();

    // Verify all fetch calls use internal cluster DNS
    for (const call of mockFetch.mock.calls) {
      const url = call[0] as string;
      expect(url).toContain(".sa9-marketing.svc.cluster.local");
    }
  });

  it("health endpoints are on port 3000", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    await GET();

    for (const call of mockFetch.mock.calls) {
      const url = call[0] as string;
      expect(url).toContain(":3000");
    }
  });

  it("health endpoints use /api/health path", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });
    await GET();

    for (const call of mockFetch.mock.calls) {
      const url = call[0] as string;
      expect(url).toMatch(/\/api\/health$/);
    }
  });
});
