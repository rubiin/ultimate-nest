import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";
import { SENTRY_DSN_REGEX } from "@common/constant";

export const sentryConfigurationValidationSchema = {
  SENTRY_DSN: Joi.string().pattern(SENTRY_DSN_REGEX).required(),
  SENTRY_ENVIRONMENT: Joi.string().required(),
};

export const sentry = registerAs("sentry", () => ({
  sentryDsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
}));
