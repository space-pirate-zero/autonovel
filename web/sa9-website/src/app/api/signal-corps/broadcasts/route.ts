// Signal Corps API — Broadcasts Collection
// GET  /api/signal-corps/broadcasts  — list all broadcasts
// POST /api/signal-corps/broadcasts  — create a new broadcast

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  Platform,
  scheduleBroadcastAt,
  type BroadcastStatus,
} from "@sa9/signal-corps";
import crypto from "crypto";
import { broadcastStore, type StoredBroadcast } from "@/lib/signal-corps/broadcast-store";

// ---------------------------------------------------------------------------
// GET — list broadcasts
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  // Drafts and scheduled content are private — require a session to list them,
  // matching the mutating handlers. (The auth middleware degrades to passthrough
  // when no Clerk key is set, so each handler must self-authorize.)
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as BroadcastStatus | null;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  let broadcasts = Array.from(broadcastStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (status) {
    broadcasts = broadcasts.filter((b) => b.status === status);
  }

  const total = broadcasts.length;
  const page = broadcasts.slice(offset, offset + limit);

  return NextResponse.json({
    broadcasts: page,
    total,
    limit,
    offset,
  });
}

// ---------------------------------------------------------------------------
// POST — create broadcast
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBroadcastInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const now = new Date().toISOString();
  const broadcast: StoredBroadcast = {
    id: crypto.randomUUID(),
    title: parsed.title,
    content: parsed.content,
    platforms: parsed.platforms,
    scheduledAt: parsed.scheduledAt,
    status: parsed.scheduledAt ? "scheduled" : "draft",
    results: [],
    createdAt: now,
    updatedAt: now,
  };

  // When a scheduledAt is supplied the broadcast is created "scheduled" — it
  // must actually be enqueued as a delayed job, otherwise the worker never
  // publishes it. Scope the job to the authenticated user's connected accounts.
  if (parsed.scheduledAt) {
    const scheduledAt = new Date(parsed.scheduledAt);
    try {
      await scheduleBroadcastAt(
        {
          id: broadcast.id,
          title: broadcast.title,
          content: broadcast.content,
          platforms: broadcast.platforms as Platform[],
          scheduledAt,
          status: "scheduled",
          results: [],
          createdAt: new Date(broadcast.createdAt),
          updatedAt: new Date(broadcast.updatedAt),
        },
        userId,
        scheduledAt
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[SignalCorps] Failed to enqueue scheduled broadcast:`, message);
      // Don't persist a "scheduled" broadcast with no backing job.
      return NextResponse.json(
        { error: "Failed to schedule broadcast" },
        { status: 500 }
      );
    }
  }

  broadcastStore.set(broadcast.id, broadcast);

  return NextResponse.json({ broadcast }, { status: 201 });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface ValidatedInput {
  title: string;
  content: string;
  platforms: Platform[];
  scheduledAt?: string;
}

function parseBroadcastInput(
  body: unknown
): ValidatedInput | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (typeof b["title"] !== "string" || b["title"].trim().length === 0) {
    return { error: "title is required and must be a non-empty string" };
  }

  if (typeof b["content"] !== "string" || b["content"].trim().length === 0) {
    return { error: "content is required and must be a non-empty string" };
  }

  if (!Array.isArray(b["platforms"]) || b["platforms"].length === 0) {
    return { error: "platforms must be a non-empty array" };
  }

  const validPlatforms = Object.values(Platform) as string[];
  const platforms: Platform[] = [];
  for (const p of b["platforms"]) {
    if (!validPlatforms.includes(p as string)) {
      return { error: `Invalid platform: ${p}. Valid platforms: ${validPlatforms.join(", ")}` };
    }
    platforms.push(p as Platform);
  }

  let scheduledAt: string | undefined;
  if (b["scheduledAt"] !== undefined) {
    const d = new Date(b["scheduledAt"] as string);
    if (isNaN(d.getTime())) {
      return { error: "scheduledAt must be a valid ISO 8601 date string" };
    }
    if (d <= new Date()) {
      return { error: "scheduledAt must be in the future" };
    }
    scheduledAt = d.toISOString();
  }

  return {
    title: (b["title"] as string).trim(),
    content: (b["content"] as string).trim(),
    platforms,
    scheduledAt,
  };
}

