import { registerAs } from "@nestjs/config";

export const redis = registerAs("redis", () => ({
	url: process.env.REDIS_URL,
	ttl: +process.env.REDIS_TTL,
}));
