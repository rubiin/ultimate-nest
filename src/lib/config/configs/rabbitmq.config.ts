import process from "node:process";

import { RABBIT_MQ_URI_REGEX } from "@common/constant";
import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber, envString } from "./schema.helpers";

export const rabbitmqConfigValidationSchema = z.object({
  RABBITMQ_DEFAULT_PREFETCH: envNumber(),
  RABBITMQ_EXCHANGE: envString(),
  RABBITMQ_URI: z.string().regex(RABBIT_MQ_URI_REGEX),
});

export const rabbitmq = registerAs("rabbitmq", () => ({
  exchange: process.env.RABBITMQ_EXCHANGE,
  prefetchCount: process.env.RABBITMQ_DEFAULT_PREFETCH,
  url: process.env.RABBITMQ_URI,
}));
