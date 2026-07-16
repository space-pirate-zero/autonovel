"use client";

import { useEffect, useRef } from "react";

/**
 * Barely-there Matrix code rain — a fixed, ultra-faint canvas behind all
 * content (à la lasthumanceo.com, dialed way down). Cyan glyphs, ~4% opacity,
 * paused for reduced-motion and when the tab is hidden.
 */
export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs = "アカサタナハマヤラワ0123456789ABCDEF<>/*+".split("");
    const fontSize = 16;
    let cols = 0;
    let drops: number[] = [];
    let raf = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    function draw() {
      frame++;
      // Throttle to ~20fps for a slow, calm rain and low CPU.
      if (frame % 3 === 0) {
        ctx.fillStyle = "rgba(3,3,3,0.10)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        for (let x = 0; x < cols; x++) {
          const ch = glyphs[(Math.random() * glyphs.length) | 0];
          const y = drops[x];
          ctx.fillStyle = Math.random() < 0.04 ? "rgba(255,20,147,0.9)" : "rgba(0,240,255,0.75)";
          ctx.fillText(ch, x * fontSize, y);
          if (y > canvas.height && Math.random() > 0.975) drops[x] = 0;
          drops[x] += fontSize;
        }
      }
      raf = requestAnimationFrame(draw);
    }

    function onVis() {
      if (document.visibilityState === "hidden") cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    }
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[400]"
      style={{ opacity: 0.06, mixBlendMode: "screen" }}
    />
  );
}
