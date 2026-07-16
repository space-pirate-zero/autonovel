import { getPostHog } from "./posthog";

/**
 * Identify a Clerk user in PostHog.
 * Call this after Clerk auth state is available.
 */
export function identifyUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  imageUrl?: string | null;
}) {
  const ph = getPostHog();
  if (!ph?.__loaded) return;

  ph.identify(user.id, {
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    avatar: user.imageUrl ?? undefined,
  });
}

/**
 * Poll Clerk's global client to identify the user.
 * Works without requiring Clerk hooks — safe to call anywhere.
 * Returns a cleanup function.
 */
export function identifyFromClerkGlobal(): () => void {
  let cancelled = false;

  // Poll every 2s but give up after ~30s so we don't leak an interval forever
  // when the user never signs in (or Clerk never loads).
  const POLL_INTERVAL_MS = 2000;
  const MAX_ATTEMPTS = 15; // 15 × 2s = 30s
  let attempts = 0;

  const interval = setInterval(() => {
    if (cancelled) return;

    attempts += 1;

    const w = window as unknown as {
      Clerk?: {
        user?: {
          id: string;
          primaryEmailAddress?: { emailAddress: string };
          fullName?: string;
          imageUrl?: string;
        };
      };
    };

    const user = w.Clerk?.user;

    if (user) {
      identifyUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        imageUrl: user.imageUrl,
      });
      clearInterval(interval);
      return;
    }

    if (attempts >= MAX_ATTEMPTS) {
      clearInterval(interval);
    }
  }, POLL_INTERVAL_MS);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
