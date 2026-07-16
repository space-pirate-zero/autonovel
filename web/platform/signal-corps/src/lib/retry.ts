// Signal Corps — Retry helper
// Shared exponential backoff wrapper for platform adapter HTTP calls.
// Retries on 429 (rate limit), 5xx, and transient network failures.

export interface RetryOptions {
  /** Maximum attempts, inclusive of the first call. Default 3. */
  maxAttempts?: number;
  /** Initial backoff in milliseconds. Default 500. */
  baseDelayMs?: number;
  /** Max backoff between attempts in ms. Default 8000. */
  maxDelayMs?: number;
  /** Add jitter to avoid thundering-herd retries. Default true. */
  jitter?: boolean;
}

export interface RetryableError extends Error {
  status?: number;
}

/**
 * Execute an async operation with exponential backoff retry.
 * Retries when the error is a network failure or the status is 429/5xx.
 *
 * Usage:
 * ```ts
 * const response = await withRetry(() => fetch(url, init));
 * if (!response.ok) throw new Error(...);
 * ```
 */
export async function withRetry<T>(
  op: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 8000;
  const jitter = options.jitter ?? true;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await op();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !isRetryable(err)) {
        throw err;
      }
      const delay = computeBackoff(attempt, baseDelayMs, maxDelayMs, jitter);
      await sleep(delay);
    }
  }
  // Unreachable but required for type-check
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Wraps `fetch` with retry logic. If the response status is 429 or 5xx, it
 * throws a RetryableError so `withRetry` picks it up. Otherwise returns the
 * Response untouched.
 */
export async function fetchWithRetry(
  input: string | URL | Request,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(input, init);
    if (response.status === 429 || response.status >= 500) {
      const err: RetryableError = new Error(
        `HTTP ${response.status} from ${getUrlString(input)}`
      );
      err.status = response.status;
      throw err;
    }
    return response;
  }, retryOptions);
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const status = (err as RetryableError).status;
  if (status === 429) return true;
  if (status && status >= 500 && status <= 599) return true;
  // Node fetch network failures do not carry a status; treat them as retryable.
  if (status === undefined) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("econnreset") ||
      msg.includes("etimedout") ||
      msg.includes("socket hang up")
    ) {
      return true;
    }
  }
  return false;
}

function computeBackoff(
  attempt: number,
  base: number,
  max: number,
  jitter: boolean
): number {
  const exp = Math.min(base * 2 ** (attempt - 1), max);
  if (!jitter) return exp;
  // Full jitter: random in [0, exp]
  return Math.floor(Math.random() * exp);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUrlString(input: string | URL | Request): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}
