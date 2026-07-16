// Middleware
export { createAuthMiddleware, authMiddlewareMatcher, hasValidClerkKey } from "./middleware";
export type { AuthMiddlewareOptions } from "./types";

// Server-side helpers
export { getAuthToken, getCurrentUserId, getOptionalAuth } from "./helpers";

// Provider utilities (use ClerkProvider directly in each app's layout)
export { sa9ClerkAppearance } from "./provider";

// Waitlist components
export { WaitlistGate, WaitlistPage } from "./waitlist";

// Client utilities
export { useSafeAuth } from "./client";
