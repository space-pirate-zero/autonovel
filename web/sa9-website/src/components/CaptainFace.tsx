"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * DVD-screensaver-style bouncing Captain face + peek-in from corner.
 * Wacky, fun, on-brand.
 */
const BOUNCE_COLORS = ["#ff1493", "#00f0ff", "#39ff14", "#bf5fff", "#ff6a00", "#faff00"];
const CAPTAIN_SIZE = 120;

export function BouncingCaptain() {
  const ref = useRef<HTMLDivElement>(null);
  // Seed a non-zero on-screen start so the head is never parked in the corner,
  // even for the first paint before the animation loop takes over.
  const pos = useRef({ x: 96, y: 140, vx: 3.6, vy: 3.0 });
  const [color, setColor] = useState("#ff1493");

  useEffect(() => {
    const size = CAPTAIN_SIZE;
    const el = ref.current;
    if (!el) return;

    const vw = () => window.innerWidth || document.documentElement.clientWidth;
    const vh = () => window.innerHeight || document.documentElement.clientHeight;

    // Kick off from a random on-screen spot + direction each load.
    pos.current.x = Math.random() * Math.max(1, vw() - size);
    pos.current.y = Math.random() * Math.max(1, vh() - size);
    pos.current.vx = (Math.random() < 0.5 ? -1 : 1) * (3.2 + Math.random() * 1.6);
    pos.current.vy = (Math.random() < 0.5 ? -1 : 1) * (2.8 + Math.random() * 1.6);
    el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

    let raf = 0;
    let lastTime = 0;
    let bounces = 0;

    function step(time: number) {
      if (!ref.current) return;
      const dt = lastTime ? Math.min((time - lastTime) / 16, 3) : 1;
      lastTime = time;

      const p = pos.current;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const maxX = Math.max(0, vw() - size);
      const maxY = Math.max(0, vh() - size);
      let hit = false;

      if (p.x <= 0 || p.x >= maxX) {
        p.vx *= -1;
        p.x = Math.max(0, Math.min(p.x, maxX));
        hit = true;
      }
      if (p.y <= 0 || p.y >= maxY) {
        p.vy *= -1;
        p.y = Math.max(0, Math.min(p.y, maxY));
        hit = true;
      }
      if (hit) {
        bounces += 1;
        setColor(BOUNCE_COLORS[bounces % BOUNCE_COLORS.length]);
      }

      ref.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);

    // Some browsers pause rAF when the tab is hidden; restart cleanly on return.
    const onVisible = () => {
      if (!document.hidden) {
        lastTime = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 z-[600] pointer-events-none"
      style={{
        width: CAPTAIN_SIZE,
        height: CAPTAIN_SIZE,
        willChange: "transform",
        transform: `translate(${pos.current.x}px, ${pos.current.y}px)`,
      }}
      aria-hidden="true"
    >
      <div
        className="captain-circle relative w-full h-full overflow-hidden border-[4px] animate-spin-orbit"
        style={{
          borderColor: color,
          boxShadow: `0 0 20px ${color}66, 0 0 46px ${color}33`,
          animationDuration: "6s",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
      >
        <Image
          src="/images/captain-face.png"
          alt="The Captain bouncing around"
          fill
          className="object-cover object-top"
          sizes="120px"
        />
      </div>
    </div>
  );
}

/**
 * Captain face peeking in from the bottom-right corner with a wacky wobble.
 */
export function PeekingCaptain() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-0 right-8 z-50 transition-transform duration-500 ease-out cursor-pointer"
      style={{
        transform: isHovered ? "translateY(0)" : "translateY(65%)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-32 h-32 sm:w-40 sm:h-40">
        <div
          className="captain-circle relative w-full h-full overflow-hidden border-[4px] border-sa9-pink animate-float"
          style={{
            boxShadow: "0 0 30px rgba(255,20,147,0.4), 0 -10px 30px rgba(255,20,147,0.2)",
          }}
        >
          <Image
            src="/images/captain-face.png"
            alt="The Captain peeking"
            fill
            className="object-cover object-top"
            sizes="160px"
          />
        </div>
        {/* Speech bubble */}
        <div
          className={`absolute -top-16 -left-24 bg-sa9-surface-raised border-3 border-sa9-cyan px-4 py-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            boxShadow: "4px 4px 0 #005566",
          }}
        >
          <p className="font-mono text-xs text-sa9-cyan whitespace-nowrap">
            CAPTAIN_ONLINE
          </p>
          <div
            className="absolute bottom-0 right-8 translate-y-full w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid var(--color-sa9-cyan)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
