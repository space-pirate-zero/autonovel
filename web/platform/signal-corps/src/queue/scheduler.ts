// Signal Corps — Broadcast Scheduler
// Helper utilities for scheduling broadcasts at specific times using BullMQ delayed jobs

import type { RedisOptions } from "ioredis";
import type { Broadcast } from "../types.js";
import { getBroadcastQueue, scheduleBroadcast, QUEUE_NAME } from "./broadcast-queue.js";

export interface ScheduledBroadcastInfo {
  jobId: string;
  broadcastId: string;
  scheduledAt: Date;
  delayMs: number;
}

/**
 * Schedule a broadcast to be published at a future time.
 * Returns info about the queued job.
 */
export async function scheduleBroadcastAt(
  broadcast: Broadcast,
  tokenOwnerId: string,
  scheduledAt: Date,
  redisOptions?: RedisOptions
): Promise<ScheduledBroadcastInfo> {
  if (scheduledAt <= new Date()) {
    throw new Error("scheduledAt must be in the future");
  }

  const delayMs = scheduledAt.getTime() - Date.now();
  const jobId = await scheduleBroadcast(broadcast, tokenOwnerId, scheduledAt, redisOptions);

  return {
    jobId,
    broadcastId: broadcast.id,
    scheduledAt,
    delayMs,
  };
}

/**
 * Cancel a scheduled broadcast by removing its job from the queue.
 * Has no effect if the job has already started processing.
 */
export async function cancelScheduledBroadcast(
  broadcastId: string,
  redisOptions?: RedisOptions
): Promise<boolean> {
  const queue = getBroadcastQueue(redisOptions);
  const job = await queue.getJob(broadcastId);

  if (!job) {
    return false; // Job doesn't exist or already completed
  }

  const state = await job.getState();
  if (state === "active") {
    // Cannot cancel an actively processing job
    return false;
  }

  await job.remove();
  return true;
}

/**
 * Reschedule an existing broadcast to a new time.
 * Cancels the existing job and creates a new one.
 */
export async function rescheduleBroadcast(
  broadcast: Broadcast,
  tokenOwnerId: string,
  newScheduledAt: Date,
  redisOptions?: RedisOptions
): Promise<ScheduledBroadcastInfo> {
  // Cancel existing job if present
  await cancelScheduledBroadcast(broadcast.id, redisOptions);

  // Schedule at the new time
  return scheduleBroadcastAt(broadcast, tokenOwnerId, newScheduledAt, redisOptions);
}

/**
 * Get all pending scheduled broadcasts from the queue.
 */
export async function getScheduledBroadcasts(
  redisOptions?: RedisOptions
): Promise<ScheduledBroadcastInfo[]> {
  const queue = getBroadcastQueue(redisOptions);
  const delayedJobs = await queue.getJobs(["delayed"]);

  return delayedJobs.map((job) => ({
    jobId: job.id ?? job.data.broadcast.id,
    broadcastId: job.data.broadcast.id,
    scheduledAt: new Date(job.timestamp + (job.opts.delay ?? 0)),
    delayMs: job.opts.delay ?? 0,
  }));
}

export { QUEUE_NAME };
