// Signal Corps — Broadcast Queue
// BullMQ queue definition for async broadcast processing

import { Queue } from "bullmq";
import type { RedisOptions } from "ioredis";
import type { Broadcast } from "../types.js";

export const QUEUE_NAME = "signal-corps-broadcasts";

export interface BroadcastJobData {
  broadcast: Broadcast;
  /** ID used to look up platform OAuth tokens */
  tokenOwnerId: string;
}

export interface BroadcastJobResult {
  broadcastId: string;
  succeeded: string[]; // platform names
  failed: string[]; // platform names
  finalStatus: Broadcast["status"];
}

let queueInstance: Queue<BroadcastJobData, BroadcastJobResult> | null = null;

/**
 * Get (or create) the singleton BullMQ broadcast queue.
 * Call once at application startup with Redis connection options.
 */
export function getBroadcastQueue(
  redisOptions?: RedisOptions
): Queue<BroadcastJobData, BroadcastJobResult> {
  if (!queueInstance) {
    queueInstance = new Queue<BroadcastJobData, BroadcastJobResult>(QUEUE_NAME, {
      connection: redisOptions ?? getDefaultRedisOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 100 },
      },
    });
  }
  return queueInstance;
}

/**
 * Add a broadcast job to the queue for immediate processing.
 */
export async function enqueueBroadcast(
  broadcast: Broadcast,
  tokenOwnerId: string,
  redisOptions?: RedisOptions
): Promise<string> {
  const queue = getBroadcastQueue(redisOptions);
  const job = await queue.add(
    `broadcast:${broadcast.id}`,
    { broadcast, tokenOwnerId },
    { jobId: broadcast.id }
  );
  return job.id ?? broadcast.id;
}

/**
 * Schedule a broadcast job to run at a specific time.
 */
export async function scheduleBroadcast(
  broadcast: Broadcast,
  tokenOwnerId: string,
  scheduledAt: Date,
  redisOptions?: RedisOptions
): Promise<string> {
  const queue = getBroadcastQueue(redisOptions);
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());

  const job = await queue.add(
    `broadcast:${broadcast.id}`,
    { broadcast, tokenOwnerId },
    {
      jobId: broadcast.id,
      delay,
    }
  );
  return job.id ?? broadcast.id;
}

function getDefaultRedisOptions(): RedisOptions {
  return {
    host: process.env["REDIS_HOST"] ?? "localhost",
    port: parseInt(process.env["REDIS_PORT"] ?? "6379", 10),
    password: process.env["REDIS_PASSWORD"],
    maxRetriesPerRequest: null, // Required by BullMQ
  };
}
