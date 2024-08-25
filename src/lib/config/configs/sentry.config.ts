import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const sentryConfigurationValidationSchema = {
  SENTRY_DSN: Joi.string().required(),
  SENTRY_ENVIRONMENT: Joi.string().required(),
};

export const sentry = registerAs("sentry", () => ({
  sentryDsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
}));
