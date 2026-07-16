"use client";

import { useEffect } from "react";
import { marketing, content, neuro } from "./events";

/**
 * NeuroTelemetry — passive, privacy-safe behavioral instrumentation.
 *
 * Auto-captures detailed + neuroscience-grounded engagement signals from the
 * whole page, with zero per-element wiring required:
 *   • scroll depth milestones + reading vs skimming (dual-process theory)
 *   • dwell / attention per [data-section] block (IntersectionObserver)
 *   • CTA decision latency + hesitation on [data-cta] / buttons (Fitts/Hick)
 *   • rage clicks & dead clicks (frustration / cognitive load)
 *   • scroll thrash & flow state
 *   • exit intent (loss aversion) + engaged-session summary on unload
 * External-link and CTA clicks also fire the marketing.* funnel events.
 *
 * Nothing here collects PII — only interaction timing/geometry.
 */
export function NeuroTelemetry() {
  useEffect(() => {
    const t0 = performance.now();
    let firstInteractionFired = false;
    let interactions = 0;
    let maxScrollPct = 0;

    // ── first meaningful interaction ──
    const onFirst = () => {
      interactions++;
      if (!firstInteractionFired) {
        firstInteractionFired = true;
        neuro.firstInteraction(Math.round(performance.now() - t0));
      }
    };
    ["click", "keydown", "touchstart"].forEach((e) =>
      window.addEventListener(e, onFirst, { passive: true, once: false })
    );

    // ── scroll depth, velocity, thrash, flow ──
    const milestones = [25, 50, 75, 90, 100];
    const hit = new Set<number>();
    let lastY = window.scrollY;
    let lastT = performance.now();
    let lastDir = 0;
    let reversals = 0;
    let flowStart = window.scrollY;
    let flowStartT = performance.now();

    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const doc = document.documentElement;
      const pct = Math.min(
        100,
        Math.round(((y + window.innerHeight) / doc.scrollHeight) * 100)
      );
      if (pct > maxScrollPct) maxScrollPct = pct;
      for (const m of milestones) {
        if (pct >= m && !hit.has(m)) {
          hit.add(m);
          content.scrollDepth(m);
        }
      }
      const dy = y - lastY;
      const dt = Math.max(1, now - lastT);
      const vel = Math.abs(dy) / (dt / 1000); // px/sec
      const dir = Math.sign(dy);
      if (dir !== 0 && lastDir !== 0 && dir !== lastDir) {
        reversals++;
        if (reversals % 6 === 0) neuro.scrollThrash(reversals);
        // a reversal breaks flow — emit if the forward run was long
        const dist = Math.abs(y - flowStart);
        if (dist > 2500) neuro.flowState(Math.round(dist), Math.round(now - flowStartT));
        flowStart = y;
        flowStartT = now;
      }
      if (dir !== 0) lastDir = dir;
      // reading vs skimming, sampled occasionally
      if (Math.random() < 0.06 && vel > 0) {
        neuro.readingMode(vel < 900 ? "reading" : "skimming", Math.round(vel));
      }
      lastY = y;
      lastT = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── dwell / attention per [data-section] ──
    const dwellStart = new WeakMap<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const name = (en.target as HTMLElement).dataset.section || "section";
          if (en.isIntersecting) {
            dwellStart.set(en.target, performance.now());
          } else if (dwellStart.has(en.target)) {
            const ms = Math.round(performance.now() - dwellStart.get(en.target)!);
            dwellStart.delete(en.target);
            if (ms >= 1000) neuro.attentionCaptured(name, ms);
            neuro.dwell(name, ms);
          }
        }
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-section]").forEach((el) => io.observe(el));

    // ── CTA hover latency / hesitation + click funnel ──
    const hoverStart = new WeakMap<Element, number>();
    const ctaSel = "[data-cta], button, a[role='button']";
    const onOver = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.(ctaSel);
      if (el) hoverStart.set(el, performance.now());
    };
    const onOut = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.(ctaSel);
      if (el && hoverStart.has(el)) {
        const ms = Math.round(performance.now() - hoverStart.get(el)!);
        hoverStart.delete(el);
        if (ms >= 600) neuro.hesitation(label(el), ms);
      }
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    // ── clicks: CTA latency, external links, rage/dead clicks ──
    let clickBuf: { x: number; y: number; t: number }[] = [];
    const onClick = (e: MouseEvent) => {
      const now = performance.now();
      clickBuf = clickBuf.filter((c) => now - c.t < 700);
      clickBuf.push({ x: e.clientX, y: e.clientY, t: now });
      const near = clickBuf.filter(
        (c) => Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40
      );
      if (near.length >= 3) neuro.rageClick(label(e.target as Element), near.length);

      const el = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cta]"
      ) as HTMLElement | null;
      if (!el) {
        neuro.deadClick(label(e.target as Element));
        return;
      }
      const cta = el.getAttribute("data-cta") || el.textContent?.trim().slice(0, 40) || "cta";
      if (hoverStart.has(el)) {
        neuro.decisionLatency(cta, Math.round(now - hoverStart.get(el)!));
      }
      marketing.ctaClicked(cta, location.pathname);
      const href = (el as HTMLAnchorElement).href;
      if (href && el.tagName === "A" && !href.includes(location.host)) {
        marketing.externalLinkClicked(href, cta);
      }
    };
    document.addEventListener("click", onClick, { passive: true });

    // ── media plays ──
    const onPlay = (e: Event) => {
      const v = e.target as HTMLMediaElement;
      if (v?.tagName === "VIDEO" || v?.tagName === "AUDIO") {
        marketing.videoPlayed(v.currentSrc || "media", (v as HTMLElement).getAttribute("aria-label") || v.tagName);
      }
    };
    document.addEventListener("play", onPlay, { capture: true });

    // ── exit intent + engaged-session summary ──
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 4) neuro.exitIntent(maxScrollPct);
    };
    document.addEventListener("mouseleave", onMouseLeave);
    const onHide = () => {
      neuro.engagedSession(Math.round(performance.now() - t0), maxScrollPct, interactions);
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });

    return () => {
      ["click", "keydown", "touchstart"].forEach((e) =>
        window.removeEventListener(e, onFirst)
      );
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("click", onClick);
      document.removeEventListener("play", onPlay, { capture: true } as EventListenerOptions);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("pagehide", onHide);
      io.disconnect();
    };
  }, []);

  return null;
}

function label(el: Element | null): string {
  if (!el) return "unknown";
  const e = el as HTMLElement;
  return (
    e.getAttribute?.("data-cta") ||
    e.getAttribute?.("aria-label") ||
    e.id ||
    (e.textContent?.trim().slice(0, 30)) ||
    e.tagName.toLowerCase()
  );
}
