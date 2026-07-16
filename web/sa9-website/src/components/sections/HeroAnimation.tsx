"use client";

import { useEffect, useState } from "react";

interface HeroAnimationProps {
  color: string;
  accentColor: string;
}

export function HeroAnimation({ color, accentColor }: HeroAnimationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Floating orbs */}
      <div
        className="absolute w-64 h-64 rounded-none opacity-[0.04] animate-float"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          top: "10%",
          right: "5%",
        }}
      />
      <div
        className="absolute w-48 h-48 rounded-none opacity-[0.03] animate-float"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          bottom: "15%",
          right: "15%",
          animationDelay: "2s",
        }}
      />

      {/* Grid pattern */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.05] hidden lg:block">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={color}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>
      </div>

      {/* Animated scan line */}
      <div
        className="absolute left-0 w-full h-px opacity-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animation: "scanDown 4s linear infinite",
          top: "0%",
        }}
      />
    </div>
  );
}
