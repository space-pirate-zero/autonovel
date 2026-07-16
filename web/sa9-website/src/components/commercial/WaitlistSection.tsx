"use client";

import type { Product } from "@/lib/products";
import { SignupForm } from "@/components/forms/SignupForm";

const STATUS_HEADING: Record<Product["status"], string> = {
  live: "Get Started",
  beta: "Join the Beta",
  development: "Join the Waitlist",
  docs: "Stay Updated",
};

const STATUS_SUBTITLE: Record<Product["status"], string> = {
  live: "Create your account and start building today. No credit card required.",
  beta: "Be among the first to experience what comes next. Early access slots are limited.",
  development: "We are building something new. Drop your email and be first in line when we launch.",
  docs: "Get notified when new documentation and updates are published.",
};

const STATUS_FORM_TYPE: Record<Product["status"], "newsletter" | "beta" | "waitlist"> = {
  live: "newsletter",
  beta: "beta",
  development: "waitlist",
  docs: "newsletter",
};

export function WaitlistSection({ product }: { product: Product }) {
  const heading = STATUS_HEADING[product.status];
  const subtitle = STATUS_SUBTITLE[product.status];
  const formType = STATUS_FORM_TYPE[product.status];

  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      aria-labelledby="waitlist-heading"
    >
      {/* Gradient background with product colors */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, ${product.color}10 0%, transparent 50%, ${product.accentColor}10 100%)`,
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none data-grid-bg opacity-30" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <h2
          id="waitlist-heading"
          className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-4"
        >
          {heading}
        </h2>

        <p className="font-body text-sa9-text-muted text-lg mb-10">
          {subtitle}
        </p>

        <SignupForm type={formType} variant="stacked" />
      </div>
    </section>
  );
}
