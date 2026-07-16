// Signal Corps — Broadcast Worker
// BullMQ worker that processes broadcast jobs: loads tokens, calls adapters,
// aggregates results, and updates broadcast status.

import { Worker, Job } from "bullmq";
import type { RedisOptions } from "ioredis";
import {
  BroadcastStatus,
  OAuthTokens,
  PlatformResult,
} from "../types.js";
import { getAdapter } from "../adapters/index.js";
import { formatForPlatform } from "../templates/formatter.js";
import { logger } from "../lib/logger.js";
import { QUEUE_NAME, type BroadcastJobData, type BroadcastJobResult } from "./broadcast-queue.js";

// Token store interface — implementation provided by the host application
// (typically backed by the same DB/Redis that stores OAuth credentials from US-7)
export interface TokenStore {
  getTokens(ownerId: string, platform: string): Promise<OAuthTokens | null>;
}

let defaultTokenStore: TokenStore | null = null;

/**
 * Register the token store implementation.
 * Must be called before starting the worker.
 */
export function registerTokenStore(store: TokenStore): void {
  defaultTokenStore = store;
}

/**
 * Start the broadcast worker.
 * Processes jobs from the signal-corps-broadcasts queue.
 *
 * @param tokenStore  Token store for loading OAuth credentials
 * @param redisOptions  Redis connection options
 * @param concurrency  Number of concurrent jobs (default: 3)
 */
export function startBroadcastWorker(
  tokenStore?: TokenStore,
  redisOptions?: RedisOptions,
  concurrency = 3
): Worker<BroadcastJobData, BroadcastJobResult> {
  const store = tokenStore ?? defaultTokenStore;
  if (!store) {
    throw new Error("No token store registered. Call registerTokenStore() first.");
  }

  const worker = new Worker<BroadcastJobData, BroadcastJobResult>(
    QUEUE_NAME,
    async (job: Job<BroadcastJobData, BroadcastJobResult>) => {
      return processBroadcastJob(job.data, store);
    },
    {
      connection: redisOptions ?? getDefaultRedisOptions(),
      concurrency,
    }
  );

  worker.on("completed", (_job, result) => {
    logger.info(
      {
        broadcastId: result.broadcastId,
        finalStatus: result.finalStatus,
        succeeded: result.succeeded,
        failed: result.failed,
      },
      "Broadcast completed"
    );
  });

  worker.on("failed", (job, err) => {
    logger.error(
      {
        jobId: job?.id,
        broadcastId: job?.data.broadcast.id,
        err: err.message,
      },
      "Broadcast job failed"
    );
  });

  return worker;
}

async function processBroadcastJob(
  data: BroadcastJobData,
  tokenStore: TokenStore
): Promise<BroadcastJobResult> {
  const { broadcast, tokenOwnerId } = data;
  const results: PlatformResult[] = [];
  const succeeded: string[] = [];
  const failed: string[] = [];

  // Build the post template from the broadcast
  const template = {
    content: broadcast.content,
    utmParams: {
      utm_source: "", // overridden per platform in formatter
      utm_medium: "social",
      utm_campaign: broadcast.id,
      utm_content: broadcast.id,
    },
  };

  // Process each platform in parallel
  const platformResults = await Promise.allSettled(
    broadcast.platforms.map(async (platform) => {
      // Load OAuth tokens for this platform
      const tokens = await tokenStore.getTokens(tokenOwnerId, platform);
      if (!tokens) {
        return {
          platform,
          success: false,
          error: `No OAuth tokens found for platform: ${platform}`,
        } satisfies PlatformResult;
      }

      // Format the template for this platform
      const formattedTemplate = {
        ...template,
        ...formatForPlatform(template, platform, broadcast.id),
        utmParams: {
          utm_source: platform,
          utm_medium: "social",
          utm_campaign: broadcast.id,
          utm_content: broadcast.id,
        },
      };

      // Publish via the platform adapter
      const adapter = getAdapter(platform);
      return adapter.publish(formattedTemplate, tokens);
    })
  );

  // Aggregate results
  for (let i = 0; i < platformResults.length; i++) {
    const settled = platformResults[i];
    const platform = broadcast.platforms[i];

    if (!settled || !platform) continue;

    if (settled.status === "fulfilled") {
      results.push(settled.value);
      if (settled.value.success) {
        succeeded.push(platform);
      } else {
        failed.push(platform);
      }
    } else {
      results.push({
        platform,
        success: false,
        error: settled.reason instanceof Error ? settled.reason.message : String(settled.reason),
      });
      failed.push(platform);
    }
  }

  // Determine final status
  let finalStatus: BroadcastStatus;
  if (failed.length === 0) {
    finalStatus = "published";
  } else if (succeeded.length === 0) {
    finalStatus = "failed";
  } else {
    finalStatus = "partially_failed";
  }

  return {
    broadcastId: broadcast.id,
    succeeded,
    failed,
    finalStatus,
  };
}

function getDefaultRedisOptions(): RedisOptions {
  return {
    host: process.env["REDIS_HOST"] ?? "localhost",
    port: parseInt(process.env["REDIS_PORT"] ?? "6379", 10),
    password: process.env["REDIS_PASSWORD"],
    maxRetriesPerRequest: null,
  };
}
