import { REDIS_URI_REGEX } from "@common/constant";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const redisConfigValidationSchema = {
	REDIS_URI: Joi.string().pattern(REDIS_URI_REGEX).required(),
	REDIS_TTL: Joi.number().required(),
};

export const redis = registerAs("redis", () => ({
	url: process.env.REDIS_URI,
	ttl: +process.env.REDIS_TTL,
}));
