/**
 * Token Store — abstract interface with in-memory implementation.
 *
 * In production, swap `InMemoryTokenStore` for `GcpSecretManagerTokenStore`
 * which stores tokens in GCP Secret Manager under:
 *   projects/<PROJECT>/secrets/sa9-oauth-<platform>/versions/latest
 *
 * The interface is intentionally minimal — callers only need get/set/delete.
 */

import { Platform, TokenSet } from "./types";

// ── Interface ────────────────────────────────────────────────────────────────

export interface ITokenStore {
  /**
   * Retrieve a stored token set. Returns null if not found.
   *
   * `owner` scopes the token to a specific authenticated user so one user's
   * connected accounts can never be read/used by another. Omit for legacy
   * global (unscoped) storage.
   */
  get(platform: Platform, owner?: string): Promise<TokenSet | null>;
  /** Persist a token set, optionally scoped to `owner`. Overwrites any existing entry. */
  set(platform: Platform, tokens: TokenSet, owner?: string): Promise<void>;
  /** Remove a token set (disconnect), optionally scoped to `owner`. */
  delete(platform: Platform, owner?: string): Promise<void>;
  /** List all platforms that have stored tokens for `owner` (or globally). */
  listConnected(owner?: string): Promise<Platform[]>;
}

/**
 * Build the storage key for a (platform, owner) pair. Owner ids are hashed so
 * they can't inject separator characters into downstream key formats (e.g. the
 * GCP secret name), which keeps namespaces strictly isolated.
 */
function ownerScopedKey(platform: Platform, owner?: string): string {
  if (!owner) return platform;
  const safeOwner = owner.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${safeOwner}--${platform}`;
}

// ── In-Memory Implementation (dev / test) ────────────────────────────────────

class InMemoryTokenStore implements ITokenStore {
  // Keyed by ownerScopedKey(platform, owner) so per-user token sets never
  // collide with each other or with the legacy global namespace.
  private store = new Map<string, TokenSet>();

  async get(platform: Platform, owner?: string): Promise<TokenSet | null> {
    return this.store.get(ownerScopedKey(platform, owner)) ?? null;
  }

  async set(platform: Platform, tokens: TokenSet, owner?: string): Promise<void> {
    this.store.set(ownerScopedKey(platform, owner), tokens);
    console.log(
      `[token-store] Stored tokens for ${platform}${owner ? " (scoped)" : ""} (access: ...${tokens.accessToken.slice(-6)})`
    );
  }

  async delete(platform: Platform, owner?: string): Promise<void> {
    this.store.delete(ownerScopedKey(platform, owner));
  }

  async listConnected(owner?: string): Promise<Platform[]> {
    const prefix = owner ? `${owner.replace(/[^a-zA-Z0-9_-]/g, "-")}--` : "";
    const platforms = Object.values(Platform) as string[];
    const connected: Platform[] = [];
    for (const key of this.store.keys()) {
      if (owner) {
        if (!key.startsWith(prefix)) continue;
        const p = key.slice(prefix.length);
        if (platforms.includes(p)) connected.push(p as Platform);
      } else {
        // Global namespace: keys equal to a bare platform value.
        if (platforms.includes(key)) connected.push(key as Platform);
      }
    }
    return connected;
  }
}

// ── GCP Secret Manager stub (production) ─────────────────────────────────────

/**
 * GcpSecretManagerTokenStore — production implementation.
 *
 * Requires:
 *   - GCP_PROJECT_ID env var
 *   - Workload Identity or GOOGLE_APPLICATION_CREDENTIALS
 *   - Secret Manager API enabled on the project
 *   - Secrets pre-created: sa9-oauth-<platform>
 *
 * Install: pnpm add @google-cloud/secret-manager
 *
 * The dynamic import uses `any` so this file compiles without the package
 * installed in dev. TypeScript will validate once the package is added.
 */
export class GcpSecretManagerTokenStore implements ITokenStore {
  private projectId = process.env.GCP_PROJECT_ID ?? "";
  private prefix = "sa9-oauth";

  // GCP secret ids allow [A-Za-z0-9_-], which ownerScopedKey already enforces.
  private secretId(platform: Platform, owner?: string): string {
    return `${this.prefix}-${ownerScopedKey(platform, owner)}`;
  }

  private secretName(platform: Platform, owner?: string): string {
    return `projects/${this.projectId}/secrets/${this.secretId(platform, owner)}/versions/latest`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async client(): Promise<any> {
    // Dynamic import deferred so the package is optional in dev
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Use Function-based dynamic import so Next.js webpack doesn't try to
    // resolve the module at build time. @google-cloud/secret-manager is
    // optional and only loaded at runtime inside OAuth connect routes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await dynamicImport("@google-cloud/secret-manager");
    return new mod.SecretManagerServiceClient();
  }

  async get(platform: Platform, owner?: string): Promise<TokenSet | null> {
    try {
      const client = await this.client();
      const [version] = await client.accessSecretVersion({ name: this.secretName(platform, owner) });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = (version as any).payload?.data?.toString();
      if (!payload) return null;
      return JSON.parse(payload) as TokenSet;
    } catch {
      return null;
    }
  }

  async set(platform: Platform, tokens: TokenSet, owner?: string): Promise<void> {
    const client = await this.client();
    const secretId = this.secretId(platform, owner);
    const parent = `projects/${this.projectId}`;

    try {
      await client.addSecretVersion({
        parent: `${parent}/secrets/${secretId}`,
        payload: { data: Buffer.from(JSON.stringify(tokens)) },
      });
    } catch {
      // Secret doesn't exist yet — create it first, then add version
      await client.createSecret({
        parent,
        secretId,
        secret: { replication: { automatic: {} } },
      });
      await client.addSecretVersion({
        parent: `${parent}/secrets/${secretId}`,
        payload: { data: Buffer.from(JSON.stringify(tokens)) },
      });
    }
  }

  async delete(platform: Platform, owner?: string): Promise<void> {
    const client = await this.client();
    const secretId = this.secretId(platform, owner);
    await client.deleteSecret({ name: `projects/${this.projectId}/secrets/${secretId}` });
  }

  async listConnected(owner?: string): Promise<Platform[]> {
    const client = await this.client();
    const [secrets] = await client.listSecrets({
      parent: `projects/${this.projectId}`,
      filter: `name:${this.prefix}-`,
    });

    const scopedPrefix = `${this.prefix}-${owner ? `${owner.replace(/[^a-zA-Z0-9_-]/g, "-")}--` : ""}`;
    const platforms = Object.values(Platform) as string[];

    return (secrets as Array<{ name?: string }>)
      .map((s) => {
        const parts = s.name?.split("/") ?? [];
        const secretId = parts[parts.length - 1] ?? "";
        if (!secretId.startsWith(scopedPrefix)) return null;
        const rest = secretId.slice(scopedPrefix.length);
        // For the global namespace, reject any owner-scoped secret (contains "--").
        if (!owner && rest.includes("--")) return null;
        return rest;
      })
      .filter((p): p is Platform => p !== null && platforms.includes(p));
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

function createTokenStore(): ITokenStore {
  if (process.env.GCP_PROJECT_ID && process.env.NODE_ENV === "production") {
    return new GcpSecretManagerTokenStore();
  }
  return new InMemoryTokenStore();
}

/**
 * Shared token store singleton.
 * Swap to GcpSecretManagerTokenStore by setting GCP_PROJECT_ID in production env.
 */
export const tokenStore: ITokenStore = createTokenStore();
