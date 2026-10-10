import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

// Optional integration: absent is valid, empty is not.
export const sentryConfigValidationSchema = z.object({
  SENTRY_DSN: envString().optional(),
  SENTRY_ENVIRONMENT: envString().optional(),
});

export const sentry = registerAs("sentry", () => ({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
}));
