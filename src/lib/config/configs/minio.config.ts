import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envPort, envString } from "./schema.helpers";

export const minioConfigValidationSchema = z.object({
  MINIO_HOST: envString(),
  MINIO_PORT: envPort(),
  MINIO_ACCESS_KEY: envString(),
  MINIO_SECRET_KEY: envString(),
  MINIO_USE_SSL: z.stringbool(),
});

export const minio = registerAs("minio", () => ({
  // Non-null assertions are safe here: every field below is required in
  // minioConfigValidationSchema, so Zod rejects the config at boot otherwise.
  endPoint: process.env.MINIO_HOST!,
  port: Number.parseInt(process.env.MINIO_PORT!, 10),
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  useSSl: process.env.MINIO_USE_SSL === "true",
}));
