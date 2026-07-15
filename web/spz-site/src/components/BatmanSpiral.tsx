"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Batman 1966 TV show spiral transition — alternating color wedges
 * spiral inward while the captain's face spins and zooms into the
 * center hole, then the whole thing collapses away to reveal the page.
 */

// Pre-compute wedge paths to avoid SSR/client hydration mismatches
// from floating point differences in Math.cos/Math.sin
const WEDGE_COUNT = 16;
const SLICE_ANGLE = 360 / WEDGE_COUNT; // 22.5 degrees
const R = 100;
const CX = 100;
const CY = 100;

const WEDGE_PATHS = Array.from({ length: WEDGE_COUNT }, (_, i) => {
  const startRad = (i * SLICE_ANGLE * Math.PI) / 180;
  const endRad = ((i + 1) * SLICE_ANGLE * Math.PI) / 180;
  const x1 = (CX + R * Math.cos(startRad)).toFixed(4);
  const y1 = (CY + R * Math.sin(startRad)).toFixed(4);
  const x2 = (CX + R * Math.cos(endRad)).toFixed(4);
  const y2 = (CY + R * Math.sin(endRad)).toFixed(4);
  return `M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`;
});

export function BatmanSpiral() {
  const [phase, setPhase] = useState<
    "spiral-in" | "face-in" | "hold" | "spiral-out" | "done"
  >("spiral-in");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("face-in"), 600),
      setTimeout(() => setPhase("hold"), 2200),
      setTimeout(() => setPhase("spiral-out"), 2800),
      setTimeout(() => setPhase("done"), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden ${
        phase === "spiral-out" ? "animate-batman-fade-out" : ""
      }`}
    >
      {/* Spinning wedge background — the classic Batman spiral */}
      <div
        className="absolute inset-0 animate-batman-wedge-spin"
        style={{ transformOrigin: "50% 50%" }}
      >
        <svg
          viewBox="0 0 200 200"
          className="absolute"
          style={{
            width: "300vmax",
            height: "300vmax",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {WEDGE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={i % 2 === 0 ? "#ff1493" : "#030303"}
            />
          ))}
        </svg>
      </div>

      {/* Second counter-rotating wedge layer for depth */}
      <div
        className="absolute inset-0 animate-batman-wedge-spin-reverse"
        style={{ transformOrigin: "50% 50%", opacity: 0.3 }}
      >
        <svg
          viewBox="0 0 200 200"
          className="absolute"
          style={{
            width: "300vmax",
            height: "300vmax",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {WEDGE_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={i % 2 === 0 ? "#00f0ff" : "transparent"}
            />
          ))}
        </svg>
      </div>

      {/* Concentric rings for spiral depth */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute captain-circle animate-batman-ring"
          style={{
            width: `${(i + 1) * 20}vmax`,
            height: `${(i + 1) * 20}vmax`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: `3px solid ${i % 2 === 0 ? "rgba(0,240,255,0.4)" : "rgba(255,20,147,0.4)"}`,
            animationDelay: `${i * 0.1}s`,
            animationDirection: i % 2 === 0 ? "normal" : "reverse",
          }}
        />
      ))}

      {/* THE FACE — spins and zooms into center, the hero of the effect */}
      <div
        className={`absolute captain-circle overflow-hidden ${
          phase === "spiral-in"
            ? "animate-batman-face-spin-in"
            : phase === "face-in"
              ? "animate-batman-face-arrive"
              : ""
        }`}
        style={{
          width: "clamp(200px, 30vmin, 360px)",
          height: "clamp(200px, 30vmin, 360px)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          border: "4px solid var(--sa9-cyan)",
          background: "var(--sa9-surface)",
          boxShadow:
            "0 0 30px rgba(0,240,255,0.5), 0 0 60px rgba(0,240,255,0.2), inset 0 0 20px rgba(0,0,0,0.5)",
          zIndex: 10,
        }}
      >
        <Image
          src="/face-ball.png"
          alt="Space Pirate Zero — The Captain"
          fill
          className="object-cover object-[center_15%]"
          priority
          sizes="360px"
        />
      </div>
    </div>
  );
}
