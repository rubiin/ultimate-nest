import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";
import { RABBIT_MQ_URI_REGEX } from "@common/constant";

export const rabbitmqConfigValidationSchema = {
  RABBITMQ_URI: Joi.string().pattern(RABBIT_MQ_URI_REGEX).required(),
  RABBITMQ_EXCHANGE: Joi.string().required(),
  RABBITMQ_DEFAULT_PREFETCH: Joi.number().required(),
};

export const rabbitmq = registerAs("rabbitmq", () => ({
  url: process.env.RABBITMQ_URI,
  exchange: process.env.RABBITMQ_EXCHANGE,
  prefetchCount: process.env.RABBITMQ_DEFAULT_PREFETCH,
}));
