"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";

type GetToken = () => Promise<string | null>;

const noopGetToken: GetToken = async () => null;

/**
 * Wrapper around Clerk's useAuth that gracefully falls back when
 * ClerkProvider is missing (e.g. no CLERK_PUBLISHABLE_KEY in dev).
 */
export function useSafeAuth(): { getToken: GetToken } {
  try {
    const auth = useClerkAuth();
    return { getToken: auth.getToken };
  } catch {
    return { getToken: noopGetToken };
  }
}

// Re-export commonly used Clerk client components
export {
  useAuth,
  useUser,
  useClerk,
  SignIn,
  SignUp,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
