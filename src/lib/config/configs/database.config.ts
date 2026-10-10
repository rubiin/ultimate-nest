import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber, envPort, envString } from "./schema.helpers";

export const databaseConfigValidationSchema = z.object({
  DB_HOST: envString(),
  DB_PORT: envPort(),
  DB_USERNAME: envString(),
  DB_PASSWORD: envString(),
  DB_DATABASE: envString(),
  // Per-process, not per-deployment: Postgres caps total connections across all workers,
  // so the pool has to be sized from configuration rather than a hardcoded constant.
  DB_POOL_MIN: envNumber(z.number().int().min(0)).default(2),
  DB_POOL_MAX: envNumber(z.number().int().min(1)).default(10),
});

export const database = registerAs("database", () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USERNAME,
  dbName: process.env.DB_DATABASE,
  pool: {
    min: +(process.env.DB_POOL_MIN ?? 2),
    max: +(process.env.DB_POOL_MAX ?? 10),
  },
}));
