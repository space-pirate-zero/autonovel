/**
 * RADAR Worker — Competitive Intelligence Scanner
 *
 * Handles: Social listening, competitor monitoring, market research,
 * lead generation signals, and opportunity scoring.
 */

import { createLogger } from "./logger";
import { BaseWorker } from "./base-worker";

const logger = createLogger("RADAR");

const worker = new BaseWorker({
  name: "RADAR",
  queueName: "radar",
  pollIntervalMs: 60000,
  maxRetries: 3,
});

worker.registerHandler("social-listen", async (job) => {
  logger.info("Processing social listening signal", { payload: job.payload });
});

worker.registerHandler("competitor-scan", async (job) => {
  logger.info("Scanning competitor activity", { payload: job.payload });
});

worker.registerHandler("opportunity-score", async (job) => {
  logger.info("Scoring business opportunity", { payload: job.payload });
});

process.on("SIGTERM", () => worker.stop());
process.on("SIGINT", () => worker.stop());

worker.start().catch((err) => logger.error("Failed to start worker", { error: String(err) }));
