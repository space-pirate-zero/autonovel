"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
      <div className="font-display font-black text-[80px] sm:text-[120px] leading-none text-sa9-red/30 mb-4">
        ERR
      </div>
      <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4">
        System Malfunction
      </h1>
      <p className="text-sa9-text-muted text-lg mb-8 max-w-md mx-auto">
        Something went wrong in the engine room. Our crew has been notified.
        {error.digest && (
          <span className="block font-mono text-xs text-sa9-text-dim mt-2">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <Button variant="primary" size="lg" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
