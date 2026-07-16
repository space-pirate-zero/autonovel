// Signal Corps API — Single Broadcast
// GET    /api/signal-corps/broadcasts/[id]  — get a broadcast
// PATCH  /api/signal-corps/broadcasts/[id]  — update a broadcast
// DELETE /api/signal-corps/broadcasts/[id]  — delete a broadcast

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  Platform,
  cancelScheduledBroadcast,
  rescheduleBroadcast,
} from "@sa9/signal-corps";
import { broadcastStore } from "@/lib/signal-corps/broadcast-store";

type RouteContext = { params: Promise<{ id: string }> };

/** Shared guard for mutating handlers. Returns userId or a 401 response. */
async function requireUser(): Promise<string | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}

// ---------------------------------------------------------------------------
// GET — single broadcast
// ---------------------------------------------------------------------------
export async function GET(_request: Request, context: RouteContext) {
  // Drafts/scheduled content are private — require a session, matching the
  // mutating handlers (the auth middleware degrades to passthrough with no
  // Clerk key, so each handler must self-authorize).
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const { id } = await context.params;
  const broadcast = broadcastStore.get(id);

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }

  return NextResponse.json({ broadcast });
}

// ---------------------------------------------------------------------------
// PATCH — update broadcast (only drafts/scheduled can be edited)
// ---------------------------------------------------------------------------
export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  const userId = guard;

  const { id } = await context.params;
  const broadcast = broadcastStore.get(id);

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }

  if (broadcast.status === "publishing" || broadcast.status === "published") {
    return NextResponse.json(
      { error: `Cannot edit a broadcast in '${broadcast.status}' status` },
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
  const updates: Partial<typeof broadcast> = {};

  if (b["title"] !== undefined) {
    if (typeof b["title"] !== "string" || b["title"].trim().length === 0) {
      return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
    }
    updates.title = (b["title"] as string).trim();
  }

  if (b["content"] !== undefined) {
    if (typeof b["content"] !== "string" || b["content"].trim().length === 0) {
      return NextResponse.json({ error: "content must be a non-empty string" }, { status: 400 });
    }
    updates.content = (b["content"] as string).trim();
  }

  if (b["platforms"] !== undefined) {
    if (!Array.isArray(b["platforms"]) || b["platforms"].length === 0) {
      return NextResponse.json(
        { error: "platforms must be a non-empty array" },
        { status: 400 }
      );
    }
    const validPlatforms = Object.values(Platform) as string[];
    for (const p of b["platforms"]) {
      if (!validPlatforms.includes(p as string)) {
        return NextResponse.json(
          { error: `Invalid platform: ${p}` },
          { status: 400 }
        );
      }
    }
    updates.platforms = b["platforms"] as Platform[];
  }

  if (b["scheduledAt"] !== undefined) {
    if (b["scheduledAt"] === null) {
      updates.scheduledAt = undefined;
      updates.status = "draft";
    } else {
      const d = new Date(b["scheduledAt"] as string);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "scheduledAt must be a valid ISO 8601 date string" },
          { status: 400 }
        );
      }
      if (d <= new Date()) {
        return NextResponse.json(
          { error: "scheduledAt must be in the future" },
          { status: 400 }
        );
      }
      updates.scheduledAt = d.toISOString();
      updates.status = "scheduled";
    }
  }

  const updated = {
    ...broadcast,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // ── Keep the BullMQ queue in sync with the store ──────────────────────────
  // A scheduled broadcast is backed by a delayed job. If we mutate the store
  // without touching the queue, the worker publishes stale content (or fires a
  // broadcast the user just unscheduled).
  const wasScheduled = broadcast.status === "scheduled";
  const willBeScheduled = updated.status === "scheduled";
  const contentOrTimeChanged =
    updates.title !== undefined ||
    updates.content !== undefined ||
    updates.platforms !== undefined ||
    updates.scheduledAt !== undefined;

  if (wasScheduled && !willBeScheduled) {
    // Unscheduling (e.g. scheduledAt: null → back to draft): remove the job.
    // cancelScheduledBroadcast returns false when the job is missing OR is
    // actively publishing; we can't tell them apart, so treat a failed cancel
    // as "can't safely unschedule" and surface 409 rather than risk a job that
    // still fires after the store says draft.
    let cancelled = false;
    try {
      cancelled = await cancelScheduledBroadcast(id);
    } catch (err) {
      console.error(`[SignalCorps] Error cancelling job for ${id}:`, err);
    }
    if (!cancelled) {
      return NextResponse.json(
        { error: "Cannot unschedule: the broadcast is being published or its job could not be removed" },
        { status: 409 }
      );
    }
  } else if (willBeScheduled && (wasScheduled ? contentOrTimeChanged : true)) {
    // Either newly scheduled, or an edit to an already-scheduled broadcast:
    // (re)enqueue the job with the merged content/time. rescheduleBroadcast
    // removes any existing job first and throws if it is actively publishing.
    const scheduledAt = new Date(updated.scheduledAt as string);
    try {
      await rescheduleBroadcast(
        {
          id: updated.id,
          title: updated.title,
          content: updated.content,
          platforms: updated.platforms as Platform[],
          scheduledAt,
          status: "scheduled",
          results: [],
          createdAt: new Date(updated.createdAt),
          updatedAt: new Date(updated.updatedAt),
        },
        userId,
        scheduledAt
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[SignalCorps] Failed to reschedule broadcast ${id}:`, message);
      return NextResponse.json(
        { error: "Cannot update: the broadcast is currently being published" },
        { status: 409 }
      );
    }
  }

  broadcastStore.set(id, updated);

  return NextResponse.json({ broadcast: updated });
}

// ---------------------------------------------------------------------------
// DELETE — remove broadcast
// ---------------------------------------------------------------------------
export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const { id } = await context.params;
  const broadcast = broadcastStore.get(id);

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
  }

  if (broadcast.status === "publishing") {
    return NextResponse.json(
      { error: "Cannot delete a broadcast that is currently publishing" },
      { status: 409 }
    );
  }

  // Cancel the delayed job first so the worker doesn't publish a broadcast the
  // user just deleted. Only scheduled broadcasts have a backing job; for those,
  // a failed cancel (missing OR actively publishing — indistinguishable) means
  // we can't safely delete, so return 409 instead of orphaning a live job.
  if (broadcast.status === "scheduled") {
    let cancelled = false;
    try {
      cancelled = await cancelScheduledBroadcast(id);
    } catch (err) {
      console.error(`[SignalCorps] Error cancelling job for ${id}:`, err);
    }
    if (!cancelled) {
      return NextResponse.json(
        { error: "Cannot delete: the broadcast is being published or its job could not be removed" },
        { status: 409 }
      );
    }
  }

  broadcastStore.delete(id);

  return NextResponse.json({ ok: true, deleted: id });
}
