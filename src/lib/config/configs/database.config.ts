import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envPort, envString } from "./schema.helpers";

export const databaseConfigValidationSchema = z.object({
  DB_HOST: envString(),
  DB_PORT: envPort(),
  DB_USERNAME: envString(),
  DB_PASSWORD: envString(),
  DB_DATABASE: envString(),
});

export const database = registerAs("database", () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USERNAME,
  dbName: process.env.DB_DATABASE,
}));
