import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const redis = registerAs("redis", () => ({
	url: process.env.REDIS_URI,
	ttl: +process.env.REDIS_TTL,
}));

export const redisConfigValidationSchema = {
	REDIS_URI: Joi.string()
		.pattern(/^redis:\/\/(?:([^:@]+):([^:@]+)@)?([^/:]+)(?::(\d+))?(?:\/(\d+))?$/)
		.required(),
	REDIS_TTL: Joi.number().required(),
};
