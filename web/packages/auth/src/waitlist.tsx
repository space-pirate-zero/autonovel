import { Waitlist } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sa9ClerkAppearance } from "./provider";
import { hasValidClerkKey } from "./middleware";
import type { ComponentProps } from "react";

/**
 * Server component that gates content behind waitlist approval.
 * Renders children only if the user is approved.
 * Shows a waitlist status screen otherwise.
 * Passes through when Clerk is not configured.
 */
export async function WaitlistGate({
  children,
  pendingContent,
}: {
  children: React.ReactNode;
  pendingContent?: React.ReactNode;
}) {
  // Without Clerk keys, pass through (dev mode)
  if (!hasValidClerkKey()) {
    return <>{children}</>;
  }

  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sa9-surface">
        <div className="max-w-md text-center space-y-6 p-8">
          <h1 className="font-display text-2xl uppercase tracking-widest text-sa9-text">
            Access Required
          </h1>
          <p className="font-mono text-sm text-sa9-text-dim">
            Sign up to join the waitlist.
          </p>
          <WaitlistPage />
        </div>
      </div>
    );
  }

  const user = await currentUser();
  // Clerk Waitlist mode sets user status — approved users can proceed.
  // When waitlist mode is active, only approved users can sign in,
  // so if they have a session they're approved.
  // For additional granularity, check publicMetadata.
  const status = (user?.publicMetadata as Record<string, unknown>)?.waitlistStatus;

  if (status === "pending") {
    return (
      pendingContent ?? (
        <div className="flex min-h-screen items-center justify-center bg-sa9-surface">
          <div className="max-w-md text-center space-y-6 p-8">
            <div className="w-16 h-16 mx-auto border-[3px] border-sa9-cyan rounded-full flex items-center justify-center">
              <span className="text-sa9-cyan text-2xl">&#x23F3;</span>
            </div>
            <h1 className="font-display text-2xl uppercase tracking-widest text-sa9-text">
              On the Waitlist
            </h1>
            <p className="font-mono text-sm text-sa9-text-dim leading-relaxed">
              SIGNAL_LOCKED. Your request is in the queue.
              <br />
              We&apos;ll notify you when access is granted.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

/**
 * Pre-styled waitlist page using Clerk's built-in Waitlist component
 * with SA9 design tokens. Falls back to a placeholder when Clerk is not configured.
 */
export function WaitlistPage({
  appearance,
}: {
  appearance?: ComponentProps<typeof Waitlist>["appearance"];
}) {
  if (!hasValidClerkKey()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sa9-surface p-4">
        <div className="max-w-md text-center space-y-6 p-8">
          <h1 className="font-display text-2xl uppercase tracking-widest text-sa9-text">
            Waitlist Coming Soon
          </h1>
          <p className="font-mono text-sm text-sa9-text-dim">
            Configure Clerk to enable the waitlist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sa9-surface p-4">
      <Waitlist appearance={appearance ?? sa9ClerkAppearance} />
    </div>
  );
}
