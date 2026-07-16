export interface AuthMiddlewareOptions {
  /** Routes that skip auth entirely (Clerk createRouteMatcher patterns). */
  publicRoutes?: string[];
  /** Routes that require auth (if set, only these are protected; otherwise everything non-public is protected). */
  protectedRoutes?: string[];
  /** Whether to add security headers (CSP, HSTS, etc). Default: true. */
  securityHeaders?: boolean;
  /** Per-site CSP directive overrides. Keys are CSP directive names, values are source arrays. */
  cspDirectives?: Record<string, string[]>;
  /** Hook that runs before Clerk auth. Return a Response to short-circuit, or void to continue. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBeforeAuth?: (req: any) => any;
  /** Custom auth page paths. */
  authPages?: { signIn?: string; signUp?: string };
  /** Where to redirect authenticated users from auth pages. Default: "/dashboard". */
  afterAuthRedirect?: string;
  /** Custom logic to determine if a public route should actually require auth. */
  requireAuthForPublicRoute?: (pathname: string) => boolean;
}
