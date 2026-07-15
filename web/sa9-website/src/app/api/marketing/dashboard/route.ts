// /api/marketing/dashboard — SA9 Marketing Cloud aggregated metrics
//
// Returns a MarketingDashboard-compatible JSON payload consumed by the
// iMessage extension and any other marketing dashboard clients.
//
// In production, activeVisitors and topPages come from PostHog.
// Waitlist count comes from Clerk user metadata or a DB count.
// This implementation returns well-structured placeholder data so the
// Swift client has a stable contract to code against.

import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Response shape — matches Swift MarketingDashboard model
// ---------------------------------------------------------------------------

export interface PageMetricResponse {
  path: string;
  visitors: number;
  bounceRate: number;
}

export interface DashboardResponse {
  activeVisitors: number;
  topPages: PageMetricResponse[];
  waitlistCount: number;
  timestamp: string; // ISO 8601
  /**
   * True while the figures are placeholder data rather than live PostHog/DB
   * queries. Deferred: replace the fetchers below with real integrations and
   * set this to false. Clients should surface a "sample data" indicator when
   * this is true.
   */
  mock: boolean;
}

// ---------------------------------------------------------------------------
// GET /api/marketing/dashboard
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse<DashboardResponse>> {
  // ------------------------------------------------------------------
  // Active visitors
  // Production: query PostHog /api/projects/:id/insights/trend with
  //   events: [{ id: "$pageview", math: "dau" }], date_from: "-1h"
  // ------------------------------------------------------------------
  const activeVisitors = await fetchActiveVisitors();

  // ------------------------------------------------------------------
  // Top pages
  // Production: PostHog top-pages insight query filtered to last 24h
  // ------------------------------------------------------------------
  const topPages = await fetchTopPages();

  // ------------------------------------------------------------------
  // Waitlist count
  // Production: SELECT COUNT(*) FROM users WHERE metadata->>'waitlist' = 'true'
  //   or Clerk organizationMembership count for the waitlist org
  // ------------------------------------------------------------------
  const waitlistCount = await fetchWaitlistCount();

  const response: DashboardResponse = {
    activeVisitors,
    topPages,
    waitlistCount,
    timestamp: new Date().toISOString(),
    // Placeholder data — flip to false once the fetchers below hit real
    // PostHog/DB sources. (Deferred infra.)
    mock: true,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      // Short cache — this data should be near-real-time
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

// ---------------------------------------------------------------------------
// Data fetchers — swap placeholder implementations for real queries
// ---------------------------------------------------------------------------

async function fetchActiveVisitors(): Promise<number> {
  // TODO: integrate PostHog /api/projects/<id>/insights with $pageview + last 5min window
  // For now, return a realistic placeholder
  return 47;
}

async function fetchTopPages(): Promise<PageMetricResponse[]> {
  // TODO: integrate PostHog top-pages insight
  return [
    { path: "/", visitors: 312, bounceRate: 0.38 },
    { path: "/waitlist", visitors: 189, bounceRate: 0.21 },
    { path: "/style-circles", visitors: 94, bounceRate: 0.44 },
    { path: "/pricing", visitors: 61, bounceRate: 0.52 },
    { path: "/about", visitors: 38, bounceRate: 0.61 },
  ];
}

async function fetchWaitlistCount(): Promise<number> {
  // TODO: query Clerk or DB for confirmed waitlist signups
  return 2847;
}
