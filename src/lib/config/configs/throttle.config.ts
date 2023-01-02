import { registerAs } from "@nestjs/config";

export const throttle = registerAs("throttle", () => ({
	limit: +process.env.THROTTLE_LIMIT,
	ttl: +process.env.THROTTLE_TTL,
}));
