import { registerAs } from "@nestjs/config";

export const rabbit = registerAs("rabbit", () => ({
	uri: process.env.RABBITMQ_URI,
	exchange: process.env.RABBITMQ_EXCHANGE,
}));
