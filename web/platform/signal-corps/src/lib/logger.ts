// Signal Corps — Structured logger
// Centralized pino logger so every module emits consistent JSON logs.
// Host applications can override the level via SIGNAL_CORPS_LOG_LEVEL.

import pino from "pino";

const level = process.env["SIGNAL_CORPS_LOG_LEVEL"] ?? "info";

export const logger = pino({
  name: "signal-corps",
  level,
  base: { service: "signal-corps" },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type Logger = typeof logger;
