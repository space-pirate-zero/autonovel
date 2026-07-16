import { describe, it, expect } from "vitest";
import { GET } from "../../app/api/health/route";

describe("GET /api/health", () => {
  it("returns a Response object", async () => {
    const response = GET();
    expect(response).toBeInstanceOf(Response);
  });

  it("returns 200 OK", async () => {
    const response = GET();
    expect(response.status).toBe(200);
  });

  it("returns JSON content", async () => {
    const response = GET();
    const data = await response.json();
    expect(data).toBeDefined();
  });

  it("includes status field set to 'ok'", async () => {
    const response = GET();
    const data = await response.json();
    expect(data.status).toBe("ok");
  });

  it("includes site identifier", async () => {
    const response = GET();
    const data = await response.json();
    expect(data.site).toBe("sa9-website");
  });

  it("includes numeric timestamp", async () => {
    const response = GET();
    const data = await response.json();
    expect(typeof data.timestamp).toBe("number");
    expect(data.timestamp).toBeGreaterThan(0);
  });

  it("timestamp is recent (within last 10 seconds)", async () => {
    const response = GET();
    const data = await response.json();
    const now = Date.now();
    expect(Math.abs(now - data.timestamp)).toBeLessThan(10_000);
  });

  it("response has exactly 3 fields", async () => {
    const response = GET();
    const data = await response.json();
    const keys = Object.keys(data);
    expect(keys).toEqual(["status", "site", "timestamp"]);
  });
});
