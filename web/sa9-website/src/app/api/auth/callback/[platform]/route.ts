/**
 * GET /api/auth/callback/[platform]
 *
 * OAuth 2.0 Authorization Code callback handler.
 *
 * Flow:
 * 1. Extract `code` and `state` from query params
 * 2. Validate `state` against the CSRF cookie
 * 3. Exchange `code` for access/refresh tokens via the platform's token endpoint
 * 4. Store tokens via tokenStore
 * 5. Redirect to /connect?status=success&platform=[name]
 *    or /connect?status=error&platform=[name]&error=[message]
 *
 * Supported platforms: linkedin, reddit, twitter, facebook, instagram,
 *                      google-search-console, meta-ads, meta-business
 * Not handled here: bluesky (uses POST app-password flow)
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { Platform, TokenSet } from "@/lib/oauth/types";
import { PLATFORM_CONFIGS, getRedirectUri } from "@/lib/oauth/platforms";
import { tokenStore } from "@/lib/oauth/token-store";

const CSRF_COOKIE = "sa9_oauth_state";
const PKCE_COOKIE = "sa9_pkce_verifier";

// ── Token response shapes differ slightly per platform ────────────────────────

interface StandardTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

// ── Helper: build error redirect ──────────────────────────────────────────────

function errorRedirect(req: NextRequest, platform: string, message: string): NextResponse {
  const url = new URL("/connect", req.nextUrl.origin);
  url.searchParams.set("status", "error");
  url.searchParams.set("platform", platform);
  url.searchParams.set("error", encodeURIComponent(message));
  return NextResponse.redirect(url.toString());
}

function successRedirect(req: NextRequest, platform: string): NextResponse {
  const url = new URL("/connect", req.nextUrl.origin);
  url.searchParams.set("status", "success");
  url.searchParams.set("platform", platform);
  return NextResponse.redirect(url.toString());
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
): Promise<NextResponse> {
  const { platform: platformSlug } = await params;
  const platform = platformSlug as Platform;

  // ── Require an authenticated session ──────────────────────────────────────
  // Tokens must be stored scoped to the signed-in user (matching the Bluesky
  // connect flow and how publish/schedule look them up per-user). Derive the
  // owner from the Clerk session only — never from the request/body — so a
  // caller can only connect accounts under their own identity. Without a
  // session there is no owner to scope to, so send them to sign in.
  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/login", req.nextUrl.origin);
    signIn.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signIn.toString());
  }

  // ── Validate platform ─────────────────────────────────────────────────────
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    return NextResponse.json(
      { error: `Unsupported platform: ${platformSlug}` },
      { status: 400 }
    );
  }

  if (config.customFlow === "atproto") {
    return errorRedirect(req, platform, "bluesky_uses_post_flow");
  }

  // ── Extract query params ──────────────────────────────────────────────────
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthErrorDesc = searchParams.get("error_description");

  // Platform declined or user denied
  if (oauthError) {
    console.warn(`[oauth/callback] Platform ${platform} returned error: ${oauthError}`);
    return errorRedirect(req, platform, oauthErrorDesc ?? oauthError);
  }

  if (!code || !state) {
    return errorRedirect(req, platform, "missing_code_or_state");
  }

  // ── Validate CSRF state ───────────────────────────────────────────────────
  const cookieStore = await cookies();
  const storedState = cookieStore.get(CSRF_COOKIE)?.value;

  if (!storedState) {
    console.warn(`[oauth/callback] CSRF cookie missing for ${platform}`);
    return errorRedirect(req, platform, "csrf_state_missing");
  }

  if (storedState !== state) {
    console.warn(`[oauth/callback] CSRF state mismatch for ${platform}`);
    return errorRedirect(req, platform, "csrf_state_mismatch");
  }

  // Clear the CSRF cookie — single use
  cookieStore.delete(CSRF_COOKIE);

  // ── Exchange code for tokens ──────────────────────────────────────────────
  const clientId = process.env[config.clientIdEnvVar];
  const clientSecret = process.env[config.clientSecretEnvVar];

  if (!clientId || !clientSecret) {
    console.error(`[oauth/callback] Missing env vars for ${platform}`);
    return errorRedirect(req, platform, "server_misconfiguration");
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(platform),
    client_id: clientId,
    client_secret: clientSecret,
  });

  // Twitter uses Basic Auth instead of body credentials
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (platform === Platform.Twitter) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
    // Remove from body for Twitter
    tokenParams.delete("client_id");
    tokenParams.delete("client_secret");
    // Twitter PKCE — retrieve the code_verifier from its dedicated cookie (NOT the state param)
    const pkceVerifier = cookieStore.get(PKCE_COOKIE)?.value;
    if (!pkceVerifier) {
      console.warn(`[oauth/callback] PKCE verifier cookie missing for Twitter`);
      return errorRedirect(req, platform, "pkce_verifier_missing");
    }
    tokenParams.set("code_verifier", pkceVerifier);
    cookieStore.delete(PKCE_COOKIE);
  }

  // Reddit uses Basic Auth
  if (platform === Platform.Reddit) {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
    headers["User-Agent"] = "SA9-MarketingCloud/1.0";
    tokenParams.delete("client_id");
    tokenParams.delete("client_secret");
  }

  let tokenData: StandardTokenResponse;
  try {
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers,
      body: tokenParams.toString(),
    });

    tokenData = (await tokenResponse.json()) as StandardTokenResponse;

    if (!tokenResponse.ok || tokenData.error) {
      const errMsg = tokenData.error_description ?? tokenData.error ?? "token_exchange_failed";
      console.error(`[oauth/callback] Token exchange failed for ${platform}: ${errMsg}`);
      return errorRedirect(req, platform, errMsg);
    }
  } catch (err) {
    console.error(`[oauth/callback] Network error during token exchange for ${platform}:`, err);
    return errorRedirect(req, platform, "token_exchange_network_error");
  }

  // ── Store tokens ──────────────────────────────────────────────────────────
  const expiresAt = tokenData.expires_in
    ? Date.now() + tokenData.expires_in * 1000
    : undefined;

  const tokens: TokenSet = {
    platform,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    scope: tokenData.scope,
  };

  // Scope the stored tokens to the authenticated user so publish/schedule
  // (which read via tokenStore.get(userId, platform)) resolve them, and no
  // one else can read/use this connection.
  await tokenStore.set(platform, tokens, userId);

  console.log(
    `[oauth/callback] Successfully connected ${platform} — expires: ${
      expiresAt ? new Date(expiresAt).toISOString() : "never"
    }`
  );

  return successRedirect(req, platform);
}
