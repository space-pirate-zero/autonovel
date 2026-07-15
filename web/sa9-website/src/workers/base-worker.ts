/**
 * SA9 Base Worker — Foundation for all enterprise background workers.
 *
 * Workers poll Redis/PostgreSQL job queues and process tasks.
 * Each worker type extends this base with specific job handlers.
 */

import { createLogger } from "./logger";

interface WorkerConfig {
  name: string;
  queueName: string;
  pollIntervalMs: number;
  maxRetries: number;
}

interface Job {
  id: string;
  queueName: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
}

type JobHandler = (job: Job) => Promise<void>;

export class BaseWorker {
  private running = false;
  private config: WorkerConfig;
  private handlers: Map<string, JobHandler> = new Map();
  private logger;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.logger = createLogger(config.name);
  }

  registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  async start(): Promise<void> {
    this.running = true;
    this.logger.info(
      `Worker started — polling ${this.config.queueName} every ${this.config.pollIntervalMs}ms`
    );

    while (this.running) {
      try {
        await this.poll();
      } catch (error) {
        this.logger.error("Poll error", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      await this.sleep(this.config.pollIntervalMs);
    }
  }

  stop(): void {
    this.running = false;
    this.logger.info("Worker stopping...");
  }

  private async poll(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;
    const redisUrl = process.env.REDIS_URL;

    if (!databaseUrl || !redisUrl) {
      this.logger.warn("Waiting for database and redis connections...");
      return;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
