import process from "node:process";

import { APP_ENVIRONMENTS, VERSION_VALIDATION_MESSAGE } from "@common/constant";
import { registerAs } from "@nestjs/config";
import { isValidTimeZone } from "helper-fns";
import { z } from "zod";

import { envPort, envString, oneOf } from "./schema.helpers";

// validation schema
export const appConfigValidationSchema = z.object({
  NODE_ENV: oneOf(APP_ENVIRONMENTS),
  APP_PORT: envPort(),
  API_URL: z.url(),
  APP_PREFIX: z.string().regex(/^v\d+$/, VERSION_VALIDATION_MESSAGE),
  APP_NAME: envString(),
  CLIENT_URL: z.url(),
  ALLOWED_HOSTS: envString().optional(),
  // `allowedOrigins` reads this, so it is what the config must validate.
  ALLOWED_ORIGINS: envString().optional(),
  SWAGGER_USER: envString(),
  SWAGGER_PASSWORD: envString(),
  // Body parsers buffer the whole payload before validation, so this is per-request
  // memory. Kept low by default and raised only where a route genuinely needs it.
  APP_MAX_BODY_SIZE: z
    .string()
    .regex(/^\d+(kb|mb)$/i)
    .default("1mb"),
  TZ: z.string().refine(isValidTimeZone, "Invalid timezone, please provide a valid timezone"),
});

// config
export const app = registerAs("app", () => ({
  port: process.env.APP_PORT,
  prefix: process.env.APP_PREFIX,
  env: process.env.NODE_ENV,
  url: process.env.API_URL,
  name: process.env.APP_NAME,
  clientUrl: process.env.CLIENT_URL,
  // Absent stays absent: a "*" default here would be paired with `credentials: true`,
  // which browsers reject and which would otherwise allow any origin.
  allowedOrigins: process.env?.ALLOWED_ORIGINS?.split(",").filter(Boolean),
  maxBodySize: process.env.APP_MAX_BODY_SIZE ?? "1mb",
  swagger: {
    username: process.env.SWAGGER_USER,
    password: process.env.SWAGGER_PASSWORD,
  },
}));
