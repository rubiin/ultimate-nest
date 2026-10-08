import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const sentryConfigurationValidationSchema = z.object({
  SENTRY_DSN: envString(),
  SENTRY_ENVIRONMENT: envString(),
});

export const sentry = registerAs("sentry", () => ({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
}));
