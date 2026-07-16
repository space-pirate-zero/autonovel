/**
 * PRESS Worker — Content & SEO Pipeline
 *
 * Handles: SEO optimization, blog post generation, Substack drafts,
 * Product Hunt launch prep, and content quality scoring via SENTINEL.
 */

import { createLogger } from "./logger";
import { BaseWorker } from "./base-worker";

const logger = createLogger("PRESS");

const worker = new BaseWorker({
  name: "PRESS",
  queueName: "content",
  pollIntervalMs: 10000,
  maxRetries: 3,
});

worker.registerHandler("seo-audit", async (job) => {
  logger.info("Running SEO audit", { payload: job.payload });
});

worker.registerHandler("content-generate", async (job) => {
  logger.info("Generating content", { payload: job.payload });
});

worker.registerHandler("sentinel-check", async (job) => {
  logger.info("Running SENTINEL quality check", { payload: job.payload });
});

process.on("SIGTERM", () => worker.stop());
process.on("SIGINT", () => worker.stop());

worker.start().catch((err) => logger.error("Failed to start worker", { error: String(err) }));
