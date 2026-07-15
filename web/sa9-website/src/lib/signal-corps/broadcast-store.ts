// Shared broadcast store for the Signal Corps API routes.
//
// Lives outside the app/api tree because Next.js App Router route files
// may only export HTTP handlers + a small set of config fields. Importing
// a module from outside the route tree keeps the handlers clean while
// still giving every route sub-path access to the same store instance.
//
// ┌───────────────────────────────────────────────────────────────────────┐
// │ DEFERRED INFRA: the default implementation is an in-process Map. It is  │
// │ NOT shared across GKE replicas or across restarts — each pod sees its   │
// │ own broadcasts. This is fine for single-replica / dev, but production   │
// │ MUST swap in a Redis/Postgres-backed IBroadcastStore (see interface     │
// │ below). The abstraction boundary exists so that swap is a one-line      │
// │ change to `broadcastStore` with no route edits.                         │
// └───────────────────────────────────────────────────────────────────────┘

import type { Platform, BroadcastStatus } from "@sa9/signal-corps";

export interface StoredBroadcast {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  scheduledAt?: string;
  publishedAt?: string;
  status: BroadcastStatus;
  results: unknown[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Storage abstraction for broadcasts. Deliberately mirrors the subset of the
 * Map API the routes use (get/set/delete/values), so a durable backend can be
 * dropped in without touching handler code.
 */
export interface IBroadcastStore {
  get(id: string): StoredBroadcast | undefined;
  set(id: string, broadcast: StoredBroadcast): void;
  delete(id: string): boolean;
  values(): IterableIterator<StoredBroadcast>;
}

/**
 * In-memory implementation. Single-replica only — see the file header banner.
 */
class InMemoryBroadcastStore implements IBroadcastStore {
  private store = new Map<string, StoredBroadcast>();

  get(id: string): StoredBroadcast | undefined {
    return this.store.get(id);
  }

  set(id: string, broadcast: StoredBroadcast): void {
    this.store.set(id, broadcast);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  values(): IterableIterator<StoredBroadcast> {
    return this.store.values();
  }
}

// Emit a single, prominent warning at module load so the single-replica
// limitation is visible in production logs rather than a silent surprise.
function warnInMemoryStore(): void {
  console.warn(
    "[SignalCorps] broadcast-store is using the IN-MEMORY implementation. " +
      "State is per-process and is NOT shared across replicas or restarts. " +
      "Do NOT run multiple replicas until a Redis/Postgres-backed " +
      "IBroadcastStore is wired in. (Deferred infra.)"
  );
}

warnInMemoryStore();

export const broadcastStore: IBroadcastStore = new InMemoryBroadcastStore();
