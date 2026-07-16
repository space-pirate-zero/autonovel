import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Get the current user's Clerk JWT for API calls.
 * Redirects to login if not authenticated.
 * Call in server components / server actions only.
 */
export async function getAuthToken(): Promise<string> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) redirect("/login");
  return token;
}

/**
 * Get the current Clerk userId.
 * Redirects to login if not authenticated.
 */
export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  return userId;
}

/**
 * Get auth state without redirecting. Returns null if not authenticated.
 */
export async function getOptionalAuth() {
  const { userId, getToken } = await auth();
  if (!userId) return null;
  return { userId, getToken };
}
