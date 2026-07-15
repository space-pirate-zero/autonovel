"use client";
import { useSyncExternalStore } from "react";

export type Progress = {
  name: string;
  read: number[];          // module ep numbers marked complete
  passed: string[];        // mirror-test ids passed
  oath: boolean;
  certId?: string;
  mintedAt?: string;       // ISO date
};

const KEY = "di_progress_v1";
const EVT = "di-progress";
const TOTAL_MODULES = 14;

export const RANKS = ["Decorator", "Wedge", "Curator", "Insurgent", "Ghost"] as const;
export type Rank = (typeof RANKS)[number];

const empty: Progress = { name: "", read: [], passed: [], oath: false };

function read(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return empty;
  }
}
function write(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event(EVT));
}

// ── derived ────────────────────────────────────────────────────────────────
export function derive(p: Progress) {
  const readCount = new Set(p.read).size;
  const passCount = new Set(p.passed).size;
  const pct = Math.round((readCount / TOTAL_MODULES) * 100);
  // Insurgent Index: 60 modules · 25 mirror-tests · 15 oath
  const index = Math.min(
    100,
    Math.round((readCount / TOTAL_MODULES) * 60 + Math.min(passCount / TOTAL_MODULES, 1) * 25 + (p.oath ? 15 : 0))
  );
  let rankIdx = 0;
  if (pct >= 25) rankIdx = 1;
  if (pct >= 50) rankIdx = 2;
  if (pct >= 80) rankIdx = 3;
  if (pct >= 100 && p.oath) rankIdx = 4;
  const complete = readCount >= TOTAL_MODULES && p.oath;
  return { readCount, passCount, pct, index, rankIdx, rank: RANKS[rankIdx], complete, total: TOTAL_MODULES };
}

// ── actions ──────────────────────────────────────────────────────────────-
export const actions = {
  toggleRead(ep: number) {
    const p = read();
    p.read = p.read.includes(ep) ? p.read.filter((e) => e !== ep) : [...p.read, ep];
    write(p);
  },
  markPassed(id: string) {
    const p = read();
    if (!p.passed.includes(id)) p.passed = [...p.passed, id];
    write(p);
  },
  setName(name: string) {
    const p = read();
    p.name = name;
    write(p);
  },
  signOath(name?: string) {
    const p = read();
    p.oath = true;
    if (name) p.name = name;
    write(p);
  },
  mint(certId: string) {
    const p = read();
    p.certId = certId;
    p.mintedAt = new Date().toISOString().slice(0, 10);
    write(p);
  },
  reset() {
    write({ ...empty });
  },
};

// ── React hook (SSR-safe) ───────────────────────────────────────────────────
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}
let cache: Progress | null = null;
let cacheStr = "";
function snapshot(): Progress {
  const s = typeof window === "undefined" ? "{}" : localStorage.getItem(KEY) || "{}";
  if (s !== cacheStr) {
    cacheStr = s;
    cache = read();
  }
  return cache!;
}

export function useProgress() {
  const p = useSyncExternalStore(subscribe, snapshot, () => empty);
  return { progress: p, ...derive(p), actions };
}
