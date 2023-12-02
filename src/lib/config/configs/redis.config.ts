import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";
import { REDIS_URI_REGEX } from "@common/constant";

export const redisConfigValidationSchema = {
  REDIS_URI: Joi.string().pattern(REDIS_URI_REGEX).required(),
  REDIS_TTL: Joi.number().integer().min(1).required(),
  REDIS_USERNAME: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
};

export const redis = registerAs("redis", () => ({
  url: process.env.REDIS_URI,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
  ttl: +process.env.REDIS_TTL,
}));
