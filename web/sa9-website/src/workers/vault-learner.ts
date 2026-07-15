/**
 * VAULT Worker — Learning & Pattern Storage
 *
 * Handles: Error pattern detection, failure analysis, ADR generation,
 * vector search indexing, and self-improvement recommendations.
 */

import { createLogger } from "./logger";
import { BaseWorker } from "./base-worker";

const logger = createLogger("VAULT");

const worker = new BaseWorker({
  name: "VAULT",
  queueName: "vault",
  pollIntervalMs: 30000,
  maxRetries: 3,
});

worker.registerHandler("error-pattern", async (job) => {
  logger.info("Analyzing error pattern", { payload: job.payload });
});

worker.registerHandler("index-pattern", async (job) => {
  logger.info("Indexing pattern for vector search", { payload: job.payload });
});

worker.registerHandler("generate-adr", async (job) => {
  logger.info("Generating ADR", { payload: job.payload });
});

process.on("SIGTERM", () => worker.stop());
process.on("SIGINT", () => worker.stop());

worker.start().catch((err) => logger.error("Failed to start worker", { error: String(err) }));
