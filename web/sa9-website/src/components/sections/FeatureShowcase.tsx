"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Feature } from "@/lib/products";

interface FeatureShowcaseProps {
  features: Feature[];
  accentColor: string;
}

export function FeatureShowcase({ features, accentColor }: FeatureShowcaseProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          accentColor={accentColor}
          index={index}
        />
      ))}
    </div>
  );
}

function FeatureCard({
  feature,
  accentColor,
  index,
}: {
  feature: Feature;
  accentColor: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={cn(
        "border-3 border-sa9-border bg-sa9-surface-raised p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all duration-500 group",
        "hover:shadow-[6px_6px_0_rgba(0,0,0,0.5)] hover:-translate-x-0.5 hover:-translate-y-0.5",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{
        borderColor: isVisible ? undefined : undefined,
      }}
    >
      {/* Feature icon with animated background */}
      <div className="relative mb-4">
        <div
          className="w-12 h-12 flex items-center justify-center border-3 shadow-[2px_2px_0_rgba(0,0,0,0.5)] text-xl transition-all duration-300 group-hover:shadow-[3px_3px_0_rgba(0,0,0,0.5)] group-hover:-translate-y-0.5"
          style={{
            borderColor: accentColor,
            backgroundColor: `${accentColor}15`,
          }}
        >
          {feature.icon}
        </div>
        {/* Decorative glow on hover */}
        <div
          className="absolute inset-0 w-12 h-12 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <h3 className="font-display font-bold text-base uppercase tracking-wider text-sa9-text mb-2 group-hover:text-sa9-pink transition-colors duration-200">
        {feature.title}
      </h3>

      <p className="text-sa9-text-muted text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Bottom accent line that animates on hover */}
      <div className="mt-4 h-[3px] bg-sa9-border overflow-hidden">
        <div
          className="h-full w-0 group-hover:w-full transition-all duration-500 ease-out"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}
