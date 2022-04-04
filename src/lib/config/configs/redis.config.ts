import { registerAs } from '@nestjs/config';

export const redis = registerAs('redis', () => ({
	port: +process.env.REDIS_PORT,
	host: process.env.REDIS_HOST,
	ttl: process.env.REDIS_TTL,
}));
