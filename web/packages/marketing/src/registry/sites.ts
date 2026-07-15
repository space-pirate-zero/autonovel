/**
 * SA9 Marketing Sites — Authoritative Registry
 *
 * Single source of truth for the fleet of marketing sites deployed in the
 * `sa9-marketing` Kubernetes namespace. Every tool that needs to enumerate
 * sites — the health aggregator, the deploy script, the MCP server, the iOS
 * dashboard — should import from this module rather than hardcoding lists.
 *
 * When a new site is added:
 *   1. Append an entry below.
 *   2. Ensure the corresponding Deployment/Service exists under
 *      `infra/sa9-sites/k8s/` (the `k8sServiceName` must match).
 *   3. The site automatically flows into `/api/health/all`, the MCP
 *      `marketing.site_health` tool, and the iOS health pane.
 */

import type { DesignSystem } from "../types";

export interface MarketingSite {
  /** Short identifier used in URLs, logs, and UIs. */
  id: string;
  /** Human-readable site name. */
  name: string;
  /** Kubernetes Service name in the `sa9-marketing` namespace. */
  k8sServiceName: string;
  /** Public-facing production domain. */
  publicDomain: string;
  /** Internal cluster DNS hostname. Derived from `k8sServiceName`. */
  internalHost: string;
  /** HTTP port exposed by the pod. */
  port: number;
  /** Path to the readiness/health endpoint. */
  healthPath: string;
  /** Design system the site is built against. */
  designSystem: DesignSystem;
}

const NAMESPACE = "sa9-marketing";

function buildSite(params: {
  id: string;
  name: string;
  k8sServiceName: string;
  publicDomain: string;
  designSystem: DesignSystem;
  port?: number;
  healthPath?: string;
}): MarketingSite {
  const port = params.port ?? 3000;
  const healthPath = params.healthPath ?? "/api/health";
  return {
    id: params.id,
    name: params.name,
    k8sServiceName: params.k8sServiceName,
    publicDomain: params.publicDomain,
    internalHost: `${params.k8sServiceName}.${NAMESPACE}.svc.cluster.local`,
    port,
    healthPath,
    designSystem: params.designSystem,
  };
}

/** The authoritative fleet. Ordered by cluster rollout priority. */
export const MARKETING_SITES: readonly MarketingSite[] = [
  buildSite({
    id: "sa9-website",
    name: "SA9 Website",
    k8sServiceName: "sa9-website",
    publicDomain: "spaceshipalpha9.co",
    designSystem: "neon",
  }),
  buildSite({
    id: "spz",
    name: "Space Pirate Zero",
    k8sServiceName: "spz",
    publicDomain: "spacepiratezero.com",
    designSystem: "neon",
  }),
  buildSite({
    id: "tradecraft",
    name: "TradeCraft",
    k8sServiceName: "tradecraft",
    publicDomain: "tradecraft.spaceshipalpha9.co",
    designSystem: "neon",
  }),
  buildSite({
    id: "darkwave-web",
    name: "DARKWAVE",
    k8sServiceName: "darkwave-web",
    publicDomain: "darkwave.spaceshipalpha9.co",
    designSystem: "phosphor",
  }),
  buildSite({
    id: "ghostdeck-web",
    name: "GhostDeck",
    k8sServiceName: "ghostdeck-web",
    publicDomain: "ghostdeck.spaceshipalpha9.co",
    designSystem: "stealth",
  }),
  buildSite({
    id: "stylelift-web",
    name: "StyleLift Web",
    k8sServiceName: "stylelift-web",
    publicDomain: "app.stylelift.fashion",
    designSystem: "leopard",
  }),
  buildSite({
    id: "stylelift-marketing",
    name: "StyleLift Marketing",
    k8sServiceName: "stylelift-marketing",
    publicDomain: "stylelift.fashion",
    designSystem: "leopard",
  }),
  buildSite({
    id: "countryplus",
    name: "Country Plus",
    k8sServiceName: "countryplus",
    publicDomain: "countryplus.spaceshipalpha9.co",
    designSystem: "neon",
  }),
] as const;

/** Look up a site by id. Returns undefined for unknown ids. */
export function getMarketingSite(id: string): MarketingSite | undefined {
  return MARKETING_SITES.find((site) => site.id === id);
}

/** Build the cluster-internal health URL for a site. */
export function internalHealthUrl(site: MarketingSite): string {
  return `http://${site.internalHost}:${site.port}${site.healthPath}`;
}

/** Build the public https health URL for a site (used by external probes). */
export function publicHealthUrl(site: MarketingSite): string {
  return `https://${site.publicDomain}${site.healthPath}`;
}
