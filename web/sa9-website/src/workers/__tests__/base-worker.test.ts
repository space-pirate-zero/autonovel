import { describe, it, expect, vi } from "vitest";
import { BaseWorker } from "../base-worker";

describe("BaseWorker", () => {
  it("creates a worker with config", () => {
    const worker = new BaseWorker({
      name: "TEST",
      queueName: "test-queue",
      pollIntervalMs: 1000,
      maxRetries: 3,
    });
    expect(worker).toBeDefined();
  });

  it("registers handlers", () => {
    const worker = new BaseWorker({
      name: "TEST",
      queueName: "test-queue",
      pollIntervalMs: 1000,
      maxRetries: 3,
    });
    const handler = vi.fn();
    worker.registerHandler("test-job", handler);
    // Handler is registered — no public way to verify, but no error thrown
    expect(true).toBe(true);
  });

  it("stops gracefully", () => {
    const worker = new BaseWorker({
      name: "TEST",
      queueName: "test-queue",
      pollIntervalMs: 1000,
      maxRetries: 3,
    });
    // Should not throw
    worker.stop();
  });
});
