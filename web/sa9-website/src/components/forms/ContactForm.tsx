"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      type: (form.elements.namedItem("type") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <div className="border-3 border-sa9-cyan bg-sa9-surface-raised p-8 shadow-[4px_4px_0_#005566] text-center">
        <div className="text-4xl mb-4">&#x1F6F0;&#xFE0F;</div>
        <h3 className="font-display font-bold text-lg uppercase tracking-widest text-sa9-cyan mb-2">
          Transmission Received
        </h3>
        <p className="text-sa9-text-muted text-sm">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 font-mono text-xs text-sa9-pink hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="border-3 border-sa9-pink bg-sa9-surface-raised p-8 shadow-[4px_4px_0_#990044]">
      <h2 className="font-display font-bold text-lg uppercase tracking-widest text-sa9-pink mb-4">
        Send a Transmission
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="block font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            className="w-full bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-pink focus:outline-none transition-colors invalid:border-sa9-red peer"
            placeholder="Your name"
          />
          <p className="hidden peer-invalid:peer-not-placeholder-shown:block text-sa9-red text-xs font-mono mt-1">
            Name must be at least 2 characters
          </p>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="w-full bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-pink focus:outline-none transition-colors invalid:border-sa9-red peer"
            placeholder="you@company.com"
          />
          <p className="hidden peer-invalid:peer-not-placeholder-shown:block text-sa9-red text-xs font-mono mt-1">
            Please enter a valid email address
          </p>
        </div>
        <div>
          <label
            htmlFor="type"
            className="block font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-2"
          >
            Inquiry Type
          </label>
          <select
            id="type"
            name="type"
            className="w-full bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-pink focus:outline-none transition-colors"
          >
            <option value="press">Press / Media</option>
            <option value="partnership">Partnership</option>
            <option value="beta">Beta Access</option>
            <option value="general">General Inquiry</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="message"
            className="block font-mono text-xs uppercase tracking-widest text-sa9-text-muted mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            rows={6}
            className="w-full bg-sa9-surface border-3 border-sa9-border text-sa9-text px-4 py-3 font-mono text-sm focus:border-sa9-pink focus:outline-none transition-colors resize-none invalid:border-sa9-red peer"
            placeholder="What's on your mind?"
          />
          <p className="hidden peer-invalid:peer-not-placeholder-shown:block text-sa9-red text-xs font-mono mt-1">
            Message must be at least 10 characters
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" size="lg" disabled={status === "submitting"}>
            {status === "submitting" ? "Transmitting..." : "Transmit"}
          </Button>
          {status === "error" && (
            <span className="text-sa9-red text-xs font-mono">
              Transmission failed. Try again.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
