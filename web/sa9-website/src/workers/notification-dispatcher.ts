/**
 * BROADCAST Worker — Email & Notification Dispatcher
 *
 * Handles: Email campaigns via Listmonk, transactional emails,
 * push notifications, and in-app notification delivery.
 */

import { createLogger } from "./logger";
import { BaseWorker } from "./base-worker";

const logger = createLogger("BROADCAST-EMAIL");

const worker = new BaseWorker({
  name: "BROADCAST-EMAIL",
  queueName: "notifications",
  pollIntervalMs: 5000,
  maxRetries: 3,
});

worker.registerHandler("email-campaign", async (job) => {
  logger.info("Dispatching email campaign", { payload: job.payload });
});

worker.registerHandler("transactional-email", async (job) => {
  logger.info("Sending transactional email", { payload: job.payload });
});

worker.registerHandler("push-notification", async (job) => {
  logger.info("Sending push notification", { payload: job.payload });
});

process.on("SIGTERM", () => worker.stop());
process.on("SIGINT", () => worker.stop());

worker.start().catch((err) => logger.error("Failed to start worker", { error: String(err) }));
