// Signal Corps — Public API barrel export
// SA9 broadcast management system for multi-platform social publishing

// Core types
export type {
  BroadcastStatus,
  Broadcast,
  PlatformResult,
  PostTemplate,
  OAuthTokens,
  PlatformMetrics,
  PlatformAdapter,
} from "./types.js";
export { Platform, PLATFORM_CHAR_LIMITS } from "./types.js";

// Attribution / UTM
export type { UtmParams } from "./attribution.js";
export { generateUtmParams, buildAttributedUrl, attributeLink } from "./attribution.js";

// Template formatter
export type { FormattedPost } from "./templates/formatter.js";
export { formatForPlatform } from "./templates/formatter.js";

// Platform adapters
export {
  getAdapter,
  getAllAdapters,
  TwitterAdapter,
  LinkedInAdapter,
  FacebookAdapter,
  InstagramAdapter,
  BlueskyAdapter,
  RedditAdapter,
  SubstackAdapter,
} from "./adapters/index.js";

// Shared helpers
export { withRetry, fetchWithRetry } from "./lib/retry.js";
export type { RetryOptions } from "./lib/retry.js";
export { logger } from "./lib/logger.js";

// Queue
export type { BroadcastJobData, BroadcastJobResult } from "./queue/broadcast-queue.js";
export {
  QUEUE_NAME,
  getBroadcastQueue,
  enqueueBroadcast,
  scheduleBroadcast,
} from "./queue/broadcast-queue.js";

// Worker
export type { TokenStore } from "./queue/broadcast-worker.js";
export {
  registerTokenStore,
  startBroadcastWorker,
} from "./queue/broadcast-worker.js";

// Scheduler
export type { ScheduledBroadcastInfo } from "./queue/scheduler.js";
export {
  scheduleBroadcastAt,
  cancelScheduledBroadcast,
  rescheduleBroadcast,
  getScheduledBroadcasts,
} from "./queue/scheduler.js";
