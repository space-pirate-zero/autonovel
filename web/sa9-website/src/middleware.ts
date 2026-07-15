import { createAuthMiddleware } from "@sa9/auth/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Subdomain → product ID mapping for commercial sites
// tradecraft excluded — has its own standalone site routed via nginx
const PRODUCT_SUBDOMAINS = new Map<string, string>([
  ["stylelift", "stylelift"],
  ["ghostdeck", "ghostdeck"],
  ["darkwave", "darkwave"],
  ["brand-casino", "brand-casino"],
  ["osmix", "osmix"],
]);

// Product ID → subdomain (reverse lookup for /products/:slug redirects)
// Derived from PRODUCT_SUBDOMAINS to prevent the two maps from drifting.
const PRODUCT_ID_TO_SUBDOMAIN = new Map<string, string>();
for (const [subdomain, productId] of PRODUCT_SUBDOMAINS) {
  // Use the first subdomain mapping for each product ID (skip aliases like "atomic")
  if (!PRODUCT_ID_TO_SUBDOMAIN.has(productId)) {
    PRODUCT_ID_TO_SUBDOMAIN.set(productId, subdomain);
  }
}

/** Subdomain rewriting + /products/:slug redirects run before Clerk auth. */
function handleSubdomainRewrite(request: NextRequest): NextResponse | void {
  const hostname = request.headers.get("host") ?? "";
  const baseDomain = process.env.BASE_DOMAIN ?? "spaceshipalpha9.co";
  const url = request.nextUrl.clone();

  // Redirect /products/:slug → the commercial landing page. Until the
  // per-product subdomains have live DNS, route to the apex `/sites/:slug`
  // (always served) instead of a `{subdomain}.spaceshipalpha9.co` that would
  // dead-end in "server not found".
  const productsMatch = url.pathname.match(/^\/products\/([^/]+)$/);
  if (productsMatch) {
    const slug = productsMatch[1];
    if (PRODUCT_ID_TO_SUBDOMAIN.has(slug)) {
      url.pathname = `/sites/${slug}`;
      return NextResponse.redirect(url, 308);
    }
  }

  // Rewrite subdomain root → /sites/:productId
  const subdomain = hostname
    .replace(`.${baseDomain}`, "")
    .replace(`.localhost:3000`, "")
    .replace(`.localhost`, "");

  if (subdomain !== hostname && PRODUCT_SUBDOMAINS.has(subdomain)) {
    const productId = PRODUCT_SUBDOMAINS.get(subdomain)!;

    // Rewrite root of subdomain to commercial landing page
    if (url.pathname === "/") {
      url.pathname = `/sites/${productId}`;
      return NextResponse.rewrite(url);
    }
  }
}

// SA9 website is primarily marketing — nearly everything is public.
const authMiddleware = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/login(.*)",
    "/signup(.*)",
    "/waitlist(.*)",
    "/sites/(.*)",
    "/products(.*)",
    "/about",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
    "/blog(.*)",
    "/api/webhooks(.*)",
    "/api/health(.*)",
    // Public marketing endpoints: the contact form, newsletter signup, and OG
    // image generation must stay reachable anonymously — otherwise Clerk
    // returns 404 for signed-out visitors once a publishable key is set.
    "/api/contact",
    "/api/subscribe",
    "/api/og(.*)",
    "/sitemap.xml",
  ],
});

// Wrap auth middleware so subdomain rewrites + redirects always fire,
// even when Clerk keys are missing (dev, Docker standalone, etc.).
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const earlyResponse = handleSubdomainRewrite(request);
  if (earlyResponse) return earlyResponse;
  return authMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
