// Signal Corps API — Schedule Broadcast
// POST /api/signal-corps/broadcasts/[id]/schedule
// Schedules a broadcast for publication at a specific future time.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { scheduleBroadcastAt, Platform, cancelScheduledBroadcast } from "@sa9/signal-corps";
import { broadcastStore } from "@/lib/signal-corps/broadcast-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const stored = broadcastStore.get(id);

  if (!stored) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }

  if (stored.status === "publishing") {
    return NextResponse.json(
      { error: "Cannot schedule a broadcast that is currently publishing" },
      { status: 409 }
    );
  }

  if (stored.status === "published") {
    return NextResponse.json(
      { error: "Cannot reschedule a broadcast that has already been published" },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Validate scheduledAt
  if (!b["scheduledAt"]) {
    return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
  }

  const scheduledAt = new Date(b["scheduledAt"] as string);
  if (isNaN(scheduledAt.getTime())) {
    return NextResponse.json(
      { error: "scheduledAt must be a valid ISO 8601 date string" },
      { status: 400 }
    );
  }

  if (scheduledAt <= new Date()) {
    return NextResponse.json(
      { error: "scheduledAt must be in the future" },
      { status: 400 }
    );
  }

  // Derive the token owner from the authenticated session — never the body —
  // so a caller can only schedule with their own connected accounts.
  const tokenOwnerId = userId;

  // If already scheduled, cancel the existing job first
  if (stored.status === "scheduled") {
    // Type `err` as `unknown` so website's strict `noImplicitAny` is satisfied.
    // The old job may have already run or not exist — any failure here is non-fatal.
    await cancelScheduledBroadcast(stored.id).catch((err: unknown) => {
      console.warn(`[SignalCorps] Could not cancel existing scheduled job for ${stored.id}:`, err);
    });
  }

  const now = new Date().toISOString();

  try {
    // Convert stored broadcast to the Broadcast interface
    const broadcast = {
      id: stored.id,
      title: stored.title,
      content: stored.content,
      platforms: stored.platforms as Platform[],
      scheduledAt,
      status: "scheduled" as const,
      results: [],
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(now),
    };

    const scheduleInfo = await scheduleBroadcastAt(broadcast, tokenOwnerId, scheduledAt);

    // Update the stored broadcast
    const updated = {
      ...stored,
      status: "scheduled" as const,
      scheduledAt: scheduledAt.toISOString(),
      updatedAt: now,
    };
    broadcastStore.set(id, updated);

    return NextResponse.json({
      ok: true,
      broadcastId: id,
      jobId: scheduleInfo.jobId,
      scheduledAt: scheduledAt.toISOString(),
      delayMs: scheduleInfo.delayMs,
      message: `Broadcast scheduled for ${scheduledAt.toISOString()}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[SignalCorps] Failed to schedule broadcast ${id}:`, message);

    // Don't leak internal error detail to clients.
    return NextResponse.json(
      { error: "Failed to schedule broadcast" },
      { status: 500 }
    );
  }
}
