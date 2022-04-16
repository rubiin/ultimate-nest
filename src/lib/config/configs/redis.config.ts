import { registerAs } from "@nestjs/config";

export const redis = registerAs("redis", () => ({
	uri: process.env.REDIS_URI,
	ttl: +process.env.REDIS_TTL,
}));
