import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

function scrub(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const clone = { ...(value as Record<string, unknown>) };
  delete clone.lat;
  delete clone.lng;
  delete clone.latitude;
  delete clone.longitude;
  return clone;
}

export const appLogger = {
  info(message: string, meta?: unknown): void {
    logger.info(scrub(meta), message);
  },
  warn(message: string, meta?: unknown): void {
    logger.warn(scrub(meta), message);
  },
  error(message: string, meta?: unknown): void {
    logger.error(scrub(meta), message);
  },
};
