import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber, envPort, envString } from "./schema.helpers";

export const redisConfigValidationSchema = z.object({
  REDIS_HOST: envString(),
  // Every cache key is written as `<namespace>::<key>`, which is what lets `clear()` SCAN
  // one prefix instead of the whole database. Defaults so an unset value cannot silently
  // drop back to unscoped keys.
  REDIS_NAMESPACE: envString().default("ultimate-nest"),
  REDIS_PASSWORD: envString(),
  REDIS_PORT: envPort(),
  REDIS_TTL: envNumber(z.number().int().min(1)),
  REDIS_USERNAME: envString(),
});

export const redis = registerAs("redis", () => ({
  host: process.env.REDIS_HOST,
  namespace: process.env.REDIS_NAMESPACE ?? "ultimate-nest",
  password: process.env.REDIS_PASSWORD,
  port: +process.env.REDIS_PORT,
  ttl: +process.env.REDIS_TTL,
  username: process.env.REDIS_USERNAME,
}));
