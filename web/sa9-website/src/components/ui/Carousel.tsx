"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

/**
 * Horizontal carousel with prev/next controls.
 *
 * Buttons scroll to a computed child offset (deterministic — no reliance on
 * scrollBy + scroll-snap, which snap mandatory/smooth interactions can defeat).
 * Native swipe/trackpad scrolling still works; snap is proximity so it never
 * fights programmatic scrolls.
 */
export function Carousel({
  children,
  ariaLabel,
  itemClassName = "w-[80%] sm:w-[46%] lg:w-[31.5%]",
}: {
  children: ReactNode[];
  ariaLabel: string;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function update() {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function go(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (items.length === 0) return;
    const page = el.clientWidth * 0.85;
    const target = el.scrollLeft + dir * page;
    // Snap to the child whose left edge is nearest the target.
    let best = items[0];
    let bestDist = Infinity;
    for (const it of items) {
      const d = Math.abs(it.offsetLeft - target);
      if (d < bestDist) {
        bestDist = d;
        best = it;
      }
    }
    el.scrollTo({ left: best.offsetLeft, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        style={{ scrollBehavior: "auto" }}
        className="flex gap-6 overflow-x-auto snap-x snap-proximity pb-4 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {children.map((child, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => go(-1)}
        className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 hidden sm:flex items-center justify-center border-3 border-sa9-border bg-sa9-surface text-sa9-text font-display font-black text-xl shadow-[3px_3px_0_rgba(0,0,0,0.6)] transition-all hover:border-sa9-pink hover:text-sa9-pink ${atStart ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(1)}
        className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 hidden sm:flex items-center justify-center border-3 border-sa9-border bg-sa9-surface text-sa9-text font-display font-black text-xl shadow-[3px_3px_0_rgba(0,0,0,0.6)] transition-all hover:border-sa9-cyan hover:text-sa9-cyan ${atEnd ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        ›
      </button>
    </div>
  );
}
