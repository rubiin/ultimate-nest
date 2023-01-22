import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const rabbitmq = registerAs("rabbitmq", () => ({
	uri: process.env.RABBITMQ_URI,
	exchange: process.env.RABBITMQ_EXCHANGE,
}));

export const rabbitmqConfigValidationSchema = {
	RABBITMQ_URI: Joi.string().required(),
	RABBITMQ_EXCHANGE: Joi.string().required(),
};
