import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envPort, envString } from "./schema.helpers";

// Optional integration: absent is valid, empty is not.
export const minioConfigValidationSchema = z.object({
  MINIO_ACCESS_KEY: envString().optional(),
  MINIO_HOST: envString().optional(),
  MINIO_PORT: envPort().optional(),
  MINIO_SECRET_KEY: envString().optional(),
  MINIO_USE_SSL: z.stringbool().optional(),
});

export const minio = registerAs("minio", () => ({
  // `!` keeps the options type required for NestMinioModule; presence is
  // enforced only when the MINIO_* vars are set, since Minio is optional.
  endPoint: process.env.MINIO_HOST!,
  port: Number.parseInt(process.env.MINIO_PORT!, 10),
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  useSSl: process.env.MINIO_USE_SSL === "true",
}));
