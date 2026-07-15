/**
 * /connect — Platform Connection Admin Page
 *
 * Internal admin page for managing OAuth connections to social/marketing platforms.
 * Not indexed by search engines.
 *
 * Supports 9 platforms:
 *   linkedin, reddit, bluesky, twitter, facebook, instagram,
 *   google-search-console, meta-ads, meta-business
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectPageContent } from "./ConnectPageContent";

export const metadata: Metadata = {
  title: "Platform Connections — SA9 Marketing Cloud",
  description: "Connect social and marketing platforms to the SA9 Marketing Cloud.",
  robots: { index: false, follow: false },
};

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="font-mono text-sa9-text-muted text-sm animate-pulse">
            LOADING PLATFORMS...
          </span>
        </div>
      }
    >
      <ConnectPageContent />
    </Suspense>
  );
}
