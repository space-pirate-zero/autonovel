/**
 * POST /api/auth/connect/bluesky
 *
 * Bluesky uses the AT Protocol app-password flow, not OAuth 2.0.
 *
 * Requires an authenticated Clerk session; the resulting tokens are stored
 * scoped to that user so no one can connect/use another user's account.
 *
 * Flow:
 * 1. Requires auth; rate-limits attempts per user
 * 2. Accepts { handle, appPassword } in request body
 * 3. Calls bsky.social createSession to validate credentials
 * 4. Receives accessJwt + refreshJwt + DID
 * 5. Stores the session tokens via tokenStore, scoped to the userId
 * 6. Returns JSON { ok: true, did, handle } on success
 *
 * The caller (connect page) should POST via fetch and handle the response.
 * On success, redirect to /connect?status=success&platform=bluesky.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Platform, AtprotoSession, TokenSet } from "@/lib/oauth/types";
import { tokenStore } from "@/lib/oauth/token-store";
import { rateLimit } from "@/lib/rate-limit";

const BSKY_PDS = "https://bsky.social";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Require an authenticated session ────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Per-user rate limit ─────────────────────────────────────────────────────
  // Credential-check endpoints are brute-force targets. Cap attempts per user
  // (in-memory token bucket; single-replica — see lib/rate-limit.ts).
  if (!rateLimit(`bluesky-connect:${userId}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { handle, appPassword } = body as { handle?: string; appPassword?: string };

  if (!handle || !appPassword) {
    return NextResponse.json(
      { error: "Both 'handle' and 'appPassword' are required" },
      { status: 400 }
    );
  }

  // ── Validate handle format ──────────────────────────────────────────────────
  const normalizedHandle = handle.trim().replace(/^@/, "");
  if (!normalizedHandle.includes(".")) {
    return NextResponse.json(
      { error: "Invalid handle format. Use your full handle, e.g. yourname.bsky.social" },
      { status: 400 }
    );
  }

  // ── Create AT Protocol session ──────────────────────────────────────────────
  let session: AtprotoSession;
  try {
    const response = await fetch(`${BSKY_PDS}/xrpc/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: normalizedHandle,
        password: appPassword,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as { error?: string; message?: string };
      const upstreamMessage = errorBody.message ?? errorBody.error ?? "Authentication failed";

      // Log the upstream detail server-side, but return a single generic
      // message for any 4xx so this endpoint can't be used as an oracle to
      // probe which handles exist or whether a password is valid.
      console.error(`[oauth/bluesky] createSession failed: ${response.status} — ${upstreamMessage}`);

      if (response.status >= 400 && response.status < 500) {
        return NextResponse.json(
          { error: "Invalid handle or app password. Check your credentials and try again." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to connect to Bluesky. Please try again." },
        { status: 502 }
      );
    }

    session = (await response.json()) as AtprotoSession;
  } catch (err) {
    console.error("[oauth/bluesky] Network error during createSession:", err);
    return NextResponse.json(
      { error: "Failed to reach Bluesky. Please try again." },
      { status: 502 }
    );
  }

  // ── Store tokens ────────────────────────────────────────────────────────────
  const tokens: TokenSet = {
    platform: Platform.Bluesky,
    accessToken: session.accessJwt,
    refreshToken: session.refreshJwt,
    did: session.did,
  };

  // Scope the stored session to the authenticated user so it can never be
  // read or used on behalf of a different account.
  await tokenStore.set(Platform.Bluesky, tokens, userId);

  console.log(
    `[oauth/bluesky] Session created for @${session.handle} (DID: ${session.did})`
  );

  return NextResponse.json({
    ok: true,
    did: session.did,
    handle: session.handle,
  });
}

/**
 * GET /api/auth/connect/bluesky
 * Redirect browser attempts to the connect page with a helpful message.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.redirect(
    new URL(
      "/connect?status=error&platform=bluesky&error=use_form",
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    )
  );
}
