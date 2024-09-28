import process from "node:process"
import { registerAs } from "@nestjs/config"
import Joi from "joi"

export const redisConfigValidationSchema = {
  REDIS_TTL: Joi.number().integer().min(1).required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_USERNAME: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),

}

export const redis = registerAs("redis", () => ({
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: +process.env.REDIS_PORT,
  ttl: +process.env.REDIS_TTL,
}))
