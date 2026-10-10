import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString, oneOf } from "./schema.helpers";

export const storageConfigValidationSchema = z
  .object({
    STORAGE_DRIVER: oneOf(["local", "s3"]).optional(),
    STORAGE_ROOT: envString().optional(),
    STORAGE_SIGNING_KEY: envString().optional(),

    // S3 credentials (used once STORAGE_DRIVER is s3)
    S3_ACCESS_KEY_ID: envString().optional(),
    S3_SECRET_ACCESS_KEY: envString().optional(),
    S3_REGION: envString().optional(),
    S3_ENDPOINT: envString().optional(),

    // S3 buckets
    S3_PUBLIC_BUCKET: envString().optional(),
    S3_PRIVATE_BUCKET: envString().optional(),

    // S3 CDN
    S3_PUBLIC_CDN_URL: envString().optional(),
    S3_PRIVATE_CDN_URL: envString().optional(),
  })
  .refine(
    (env) =>
      env.STORAGE_DRIVER !== "s3" ||
      (env.S3_ACCESS_KEY_ID !== undefined &&
        env.S3_SECRET_ACCESS_KEY !== undefined &&
        env.S3_REGION !== undefined &&
        env.S3_ENDPOINT !== undefined),
    {
      message:
        "S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION and S3_ENDPOINT are required when STORAGE_DRIVER is s3",
      path: ["S3_ENDPOINT"],
    },
  )
  .refine(
    (env) =>
      env.STORAGE_DRIVER !== "s3" ||
      (env.S3_PUBLIC_BUCKET !== undefined && env.S3_PRIVATE_BUCKET !== undefined),
    {
      message: "S3_PUBLIC_BUCKET and S3_PRIVATE_BUCKET are required when STORAGE_DRIVER is s3",
      path: ["S3_PUBLIC_BUCKET"],
    },
  )
  .refine(
    (env) =>
      env.STORAGE_DRIVER !== "s3" ||
      (env.S3_PUBLIC_CDN_URL !== undefined && env.S3_PRIVATE_CDN_URL !== undefined),
    {
      message: "S3_PUBLIC_CDN_URL and S3_PRIVATE_CDN_URL are required when STORAGE_DRIVER is s3",
      path: ["S3_PUBLIC_CDN_URL"],
    },
  );

export const storage = registerAs("storage", () => ({
  driver: process.env.STORAGE_DRIVER ?? "local",
  root: process.env.STORAGE_ROOT ?? "storage",
  signingKey: process.env.STORAGE_SIGNING_KEY,
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    publicBucket: process.env.S3_PUBLIC_BUCKET,
    privateBucket: process.env.S3_PRIVATE_BUCKET,
    publicCdnUrl: process.env.S3_PUBLIC_CDN_URL,
    privateCdnUrl: process.env.S3_PRIVATE_CDN_URL,
  },
}));
