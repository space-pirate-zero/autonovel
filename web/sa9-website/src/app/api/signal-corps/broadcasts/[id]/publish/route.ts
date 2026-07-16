// Signal Corps API — Immediate Publish
// POST /api/signal-corps/broadcasts/[id]/publish
// Triggers immediate publishing of a broadcast across all configured platforms.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enqueueBroadcast, Platform } from "@sa9/signal-corps";
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
      { error: "Broadcast is already being published" },
      { status: 409 }
    );
  }

  if (stored.status === "published") {
    return NextResponse.json(
      { error: "Broadcast has already been published" },
      { status: 409 }
    );
  }

  // Consume any request body so the connection is drained, but ignore its
  // contents — the token owner is NEVER taken from the client.
  try {
    await request.text();
  } catch {
    // No body is fine; proceed with defaults
  }

  // tokenOwnerId identifies whose OAuth tokens to use. Derive it from the
  // authenticated session so a caller can only ever publish with their own
  // connected accounts, never someone else's.
  const tokenOwnerId = userId;

  // Mark as publishing
  const now = new Date().toISOString();
  const publishing = {
    ...stored,
    status: "publishing" as const,
    scheduledAt: undefined,
    updatedAt: now,
  };
  broadcastStore.set(id, publishing);

  try {
    // Convert stored broadcast to the Broadcast interface expected by the queue
    const broadcast = {
      id: stored.id,
      title: stored.title,
      content: stored.content,
      platforms: stored.platforms as Platform[],
      status: "publishing" as const,
      results: [],
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(now),
    };

    // Enqueue for async processing
    const jobId = await enqueueBroadcast(broadcast, tokenOwnerId);

    return NextResponse.json({
      ok: true,
      broadcastId: id,
      jobId,
      status: "publishing",
      message: "Broadcast queued for immediate publication",
    });
  } catch (err) {
    // Revert status on queue failure
    broadcastStore.set(id, { ...stored, status: "failed", updatedAt: new Date().toISOString() });

    const message = err instanceof Error ? err.message : String(err);
    console.error(`[SignalCorps] Failed to enqueue broadcast ${id}:`, message);

    // Don't leak internal error detail (queue host, stack, etc.) to clients.
    return NextResponse.json(
      { error: "Failed to queue broadcast" },
      { status: 500 }
    );
  }
}
