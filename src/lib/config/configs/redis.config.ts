import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber, envPort, envString } from "./schema.helpers";

export const redisConfigValidationSchema = z.object({
  REDIS_TTL: envNumber(z.number().int().min(1)),
  REDIS_HOST: envString(),
  REDIS_PORT: envPort(),
  REDIS_USERNAME: envString(),
  REDIS_PASSWORD: envString(),
});

export const redis = registerAs("redis", () => ({
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: +process.env.REDIS_PORT,
  ttl: +process.env.REDIS_TTL,
}));
