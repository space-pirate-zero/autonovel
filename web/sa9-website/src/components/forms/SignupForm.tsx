"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function SignupForm({
  type = "newsletter",
  variant = "inline",
}: {
  type?: "newsletter" | "beta" | "waitlist";
  variant?: "inline" | "stacked";
}) {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 py-3">
        <span className="font-mono text-sm text-sa9-cyan tracking-wide">
          SIGNAL_LOCKED. You&apos;re on the list.
        </span>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <form onSubmit={handleSubmit} className="max-w-md space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          className="w-full bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-pink focus:outline-none transition-colors placeholder:text-sa9-text-dim"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "submitting"}
          className="w-full"
        >
          {status === "submitting"
            ? "TRANSMITTING..."
            : type === "beta"
              ? "JOIN THE BETA"
              : type === "waitlist"
                ? "JOIN THE WAITLIST"
                : "GET DISPATCHES"}
        </Button>
        {status === "error" && (
          <p className="text-sa9-red text-xs font-mono">
            Transmission failed. Try again.
          </p>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-lg"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="flex-1 bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-pink focus:outline-none transition-colors placeholder:text-sa9-text-dim"
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === "submitting"}
      >
        {status === "submitting"
          ? "..."
          : type === "beta"
            ? "JOIN BETA"
            : type === "waitlist"
              ? "JOIN WAITLIST"
              : "GET DISPATCHES"}
      </Button>
      {status === "error" && (
        <span className="text-sa9-red text-xs font-mono self-center">
          Failed. Try again.
        </span>
      )}
    </form>
  );
}
