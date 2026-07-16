/**
 * GET /api/auth/connect/[platform]
 *
 * Initiates the OAuth 2.0 authorization code flow for a given platform.
 *
 * 1. Validates the requested platform is supported
 * 2. Generates a cryptographically-random CSRF state token
 * 3. Stores the state token in an HttpOnly cookie
 * 4. Redirects the browser to the platform's auth URL
 *
 * Bluesky is excluded here — it uses a POST app-password flow at
 * /api/auth/connect/bluesky (see that route file).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Platform } from "@/lib/oauth/types";
import { PLATFORM_CONFIGS, getRedirectUri } from "@/lib/oauth/platforms";

const CSRF_COOKIE = "sa9_oauth_state";
const PKCE_COOKIE = "sa9_pkce_verifier";
const CSRF_COOKIE_TTL_SECONDS = 600; // 10 minutes

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
): Promise<NextResponse> {
  const { platform: platformSlug } = await params;
  const platform = platformSlug as Platform;

  // ── Validate platform ───────────────────────────────────────────────────────
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    return NextResponse.json(
      { error: `Unsupported platform: ${platformSlug}` },
      { status: 400 }
    );
  }

  // Bluesky uses app-password POST flow — reject GET requests
  if (config.customFlow === "atproto") {
    return NextResponse.json(
      {
        error: "Bluesky uses app-password authentication. POST to /api/auth/connect/bluesky instead.",
      },
      { status: 405 }
    );
  }

  // ── Validate env vars are configured ───────────────────────────────────────
  const clientId = process.env[config.clientIdEnvVar];
  if (!clientId) {
    console.error(`[oauth] Missing env var: ${config.clientIdEnvVar}`);
    return NextResponse.redirect(
      new URL(
        `/connect?status=error&platform=${platform}&error=missing_client_id`,
        _req.url
      )
    );
  }

  // ── Generate CSRF state ─────────────────────────────────────────────────────
  const state = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CSRF_COOKIE_TTL_SECONDS,
    path: "/api/auth/callback",
  });

  // ── Build authorization URL ─────────────────────────────────────────────────
  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", getRedirectUri(platform));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("state", state);

  // Platform-specific extras
  if (platform === Platform.Twitter) {
    // Twitter OAuth 2.0 requires PKCE. Generate a separate code_verifier,
    // hash it with SHA-256 for the code_challenge, and store the verifier
    // in its own HttpOnly cookie (NOT the CSRF state).
    const verifier = crypto.randomUUID() + crypto.randomUUID(); // 72 chars
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    cookieStore.set(PKCE_COOKIE, verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CSRF_COOKIE_TTL_SECONDS,
      path: "/api/auth/callback",
    });
  }

  if (platform === Platform.GoogleSearchConsole) {
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
  }

  if (platform === Platform.LinkedIn) {
    // OpenID Connect
    authUrl.searchParams.set("response_type", "code");
  }

  console.log(`[oauth] Redirecting to ${platform} auth — state: ${state.slice(0, 8)}...`);

  return NextResponse.redirect(authUrl.toString());
}
