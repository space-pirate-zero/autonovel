import { MARKETING_SITES, internalHealthUrl } from "@sa9/marketing/registry";
import type { MarketingSite } from "@sa9/marketing/registry";

// Aggregator probes the per-pod cluster-internal health endpoints in
// parallel. Timeout is deliberately tight: individual pods should answer
// /api/health in a few hundred ms. A 2s ceiling keeps the overall response
// under 2.5s even in a worst-case where every pod is slow, which is the
// upper bound the iOS dashboard is willing to block on before it treats
// the request as failed.
const PROBE_TIMEOUT_MS = 2_000;

type SiteStatus = "ok" | "degraded" | "unreachable" | "error";

interface SiteHealth {
  id: string;
  name: string;
  status: SiteStatus;
  responseMs: number | null;
  [key: string]: unknown;
}

async function probe(site: MarketingSite): Promise<SiteHealth> {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(internalHealthUrl(site), { signal: controller.signal });
    const elapsed = Math.round(performance.now() - started);
    if (!res.ok) {
      return { id: site.id, name: site.name, status: "degraded", responseMs: elapsed };
    }
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { id: site.id, name: site.name, status: "ok", responseMs: elapsed, ...data };
  } catch {
    return { id: site.id, name: site.name, status: "unreachable", responseMs: null };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const results = await Promise.allSettled(MARKETING_SITES.map((site) => probe(site)));

  const sites = results.map((result, index) => {
    if (result.status === "fulfilled") return result.value;
    const site = MARKETING_SITES[index];
    return {
      id: site.id,
      name: site.name,
      status: "error" as const,
      responseMs: null,
    };
  });

  const allOk = sites.every((s) => s.status === "ok");

  return Response.json(
    { status: allOk ? "ok" : "degraded", timestamp: Date.now(), sites },
    { status: allOk ? 200 : 503 },
  );
}
