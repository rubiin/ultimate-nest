import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber } from "./schema.helpers";

export const resilienceConfigValidationSchema = z.object({
  // Per-attempt budget. This only fills in durations, so it never turns a
  // timeout on by itself - a decorator or a preset has to ask for one.
  RESILIENCE_TIMEOUT_MS: envNumber(z.number().int().min(1)),
  // Total attempts, first included. Only the broker preset turns this on, and
  // publishing is the one call here that is safe to repeat.
  RESILIENCE_RETRY_ATTEMPTS: envNumber(z.number().int().min(1)),
  RESILIENCE_BREAKER_FAILURE_RATE: envNumber(z.number().min(1).max(100)),
  RESILIENCE_BREAKER_MINIMUM_CALLS: envNumber(z.number().int().min(1)),
  RESILIENCE_BREAKER_OPEN_MS: envNumber(z.number().int().min(1)),
  // Avatar uploads are the one bandwidth- and CPU-hungry route here, so they
  // get a bulkhead: a burst of registrations waits its turn instead of starving
  // every other request.
  RESILIENCE_UPLOAD_MAX_CONCURRENT: envNumber(z.number().int().min(1)),
  RESILIENCE_UPLOAD_MAX_QUEUE: envNumber(z.number().int().min(0)),
});

// config
export const resilience = registerAs("resilience", () => ({
  breaker: {
    failureRateThreshold: +process.env.RESILIENCE_BREAKER_FAILURE_RATE,
    minimumCalls: +process.env.RESILIENCE_BREAKER_MINIMUM_CALLS,
    openDuration: +process.env.RESILIENCE_BREAKER_OPEN_MS,
  },
  retry: {
    attempts: +process.env.RESILIENCE_RETRY_ATTEMPTS,
  },
  timeout: +process.env.RESILIENCE_TIMEOUT_MS,
  upload: {
    maxConcurrent: +process.env.RESILIENCE_UPLOAD_MAX_CONCURRENT,
    maxQueue: +process.env.RESILIENCE_UPLOAD_MAX_QUEUE,
  },
}));
