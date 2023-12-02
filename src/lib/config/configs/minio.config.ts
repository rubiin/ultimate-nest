import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const minioConfigValidationSchema = {
  MINIO_HOST: Joi.string().required(),
  MINIO_PORT: Joi.number().port().required(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_USE_SSL: Joi.boolean().required(),
};

export const minio = registerAs("minio", () => ({
  host: process.env.MINIO_HOST,
  port: Number.parseInt(process.env.MINIO_PORT!, 10),
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  useSSl: process.env.MINIO_USE_SSL === "true",
}));
