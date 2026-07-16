/**
 * PULSE Worker — General Job Processor
 *
 * Handles: CI/CD events, deployment notifications, build status,
 * obfuscated public check-ins, and general background tasks.
 */

import { createLogger } from "./logger";
import { BaseWorker } from "./base-worker";

const logger = createLogger("PULSE");

const worker = new BaseWorker({
  name: "PULSE",
  queueName: "jobs",
  pollIntervalMs: 5000,
  maxRetries: 3,
});

worker.registerHandler("ci-event", async (job) => {
  logger.info("Processing CI event", { payload: job.payload });
});

worker.registerHandler("deploy-notification", async (job) => {
  logger.info("Processing deploy notification", { payload: job.payload });
});

worker.registerHandler("pulse-checkin", async (job) => {
  logger.info("Generating obfuscated public check-in", { payload: job.payload });
});

// Graceful shutdown
process.on("SIGTERM", () => worker.stop());
process.on("SIGINT", () => worker.stop());

worker.start().catch((err) => logger.error("Failed to start worker", { error: String(err) }));
