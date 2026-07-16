import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AuthMiddlewareOptions } from "./types";

/** Clerk publishable key is present and has the expected format. */
export function hasValidClerkKey(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return /^pk_(test|live)_[A-Za-z0-9+/=]{20,}$/.test(key);
}

/** Default CSP directives shared across all SA9 sites. */
const DEFAULT_CSP: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "https://*.clerk.accounts.dev",
    "https://challenges.cloudflare.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.cloudflare.com",
    "https://img.clerk.com",
    "https://*.spaceshipalpha9.co",
  ],
  "font-src": ["'self'"],
  "connect-src": [
    "'self'",
    "https://*.clerk.accounts.dev",
    "wss://*.clerk.accounts.dev",
    "https://*.spaceshipalpha9.co",
  ],
  "frame-src": [
    "'self'",
    "https://*.clerk.accounts.dev",
    "https://challenges.cloudflare.com",
  ],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

function buildCsp(
  nonce: string,
  overrides?: Record<string, string[]>
): string {
  const merged = { ...DEFAULT_CSP };

  if (overrides) {
    for (const [directive, sources] of Object.entries(overrides)) {
      merged[directive] = [
        ...(merged[directive] ?? []),
        ...sources,
      ];
    }
  }

  // Allow inline scripts. Next.js App Router does not propagate nonces to its
  // own <script> tags, so using a nonce-only policy blocks all JS and causes
  // a blank page. We keep the nonce in the header (x-nonce) for components
  // that opt in, but allow inline scripts via 'unsafe-inline'.
  if (merged["script-src"]) {
    merged["script-src"] = [`'unsafe-inline'`, ...merged["script-src"]];
  }

  return Object.entries(merged)
    .map(([key, vals]) => `${key} ${vals.join(" ")}`)
    .join("; ");
}

function addSecurityHeaders(response: NextResponse, nonce: string, cspDirectives?: Record<string, string[]>) {
  response.headers.set("x-nonce", nonce);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("Content-Security-Policy", buildCsp(nonce, cspDirectives));
}

function passthroughMiddleware(request: NextRequest) {
  return NextResponse.next();
}

/**
 * Create a Clerk-based middleware with configurable route protection,
 * security headers, and graceful degradation when Clerk keys are missing.
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    publicRoutes = ["/"],
    protectedRoutes,
    securityHeaders = true,
    cspDirectives,
    onBeforeAuth,
    authPages,
    afterAuthRedirect = "/dashboard",
    requireAuthForPublicRoute,
  } = options;

  if (!hasValidClerkKey()) {
    return passthroughMiddleware;
  }

  const isPublicRoute = createRouteMatcher(publicRoutes);
  const isProtectedRoute = protectedRoutes
    ? createRouteMatcher(protectedRoutes)
    : null;

  const signInPaths = [
    authPages?.signIn ?? "/login",
    authPages?.signUp ?? "/signup",
  ];

  return clerkMiddleware(
    async (auth, req) => {
      // Run site-specific pre-auth hook (e.g. subdomain rewriting)
      if (onBeforeAuth) {
        const result = onBeforeAuth(req);
        if (result) return result;
      }

      const { userId } = await auth();
      const path = req.nextUrl.pathname;

      // Redirect authenticated users away from auth pages
      if (userId) {
        if (
          path === "/" ||
          signInPaths.some((p) => path.startsWith(p))
        ) {
          return NextResponse.redirect(new URL(afterAuthRedirect, req.url));
        }
      }

      // Route protection
      if (isProtectedRoute) {
        // Explicit protected routes mode: only protect listed routes
        if (isProtectedRoute(req)) {
          await auth.protect();
        }
      } else {
        // Default mode: protect everything except public routes
        const isPublic = isPublicRoute(req);
        const forceAuth =
          isPublic && requireAuthForPublicRoute
            ? requireAuthForPublicRoute(path)
            : false;

        if (!isPublic || forceAuth) {
          await auth.protect();
        }
      }

      // Build response with security headers
      const nonce = btoa(crypto.randomUUID());
      const response = NextResponse.next({
        request: { headers: new Headers(req.headers) },
      });

      if (securityHeaders) {
        addSecurityHeaders(response, nonce, cspDirectives);
      }

      return response;
    },
    {
      // Fallback for Docker standalone mode where NEXT_PUBLIC_* may not be inlined at build time
      publishableKey:
        process.env.CLERK_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      // Don't pass secretKey explicitly — Clerk reads CLERK_SECRET_KEY from env automatically.
      // Passing it here requires CLERK_ENCRYPTION_KEY which adds unnecessary complexity.
    }
  );
}

/** Standard Next.js middleware matcher — skip static files and internals. */
export const authMiddlewareMatcher = [
  "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  "/(api|trpc)(.*)",
];
