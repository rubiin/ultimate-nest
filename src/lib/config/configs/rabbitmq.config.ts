import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const rabbitmq = registerAs("rabbitmq", () => ({
	url: process.env.RABBITMQ_URI,
	exchange: process.env.RABBITMQ_EXCHANGE,
	queue: process.env.RABBITMQ_QUEUE,
	prefetchCount: Number.parseInt(process.env.RABBITMQ_DEFAULT_PREFETCH, 10),
}));

export const rabbitmqConfigValidationSchema = {
	RABBITMQ_URI: Joi.string().required(),
	RABBITMQ_EXCHANGE: Joi.string().required(),
	RABBITMQ_QUEUE: Joi.string().required(),
	RABBITMQ_DEFAULT_PREFETCH: Joi.number().required(),
};
