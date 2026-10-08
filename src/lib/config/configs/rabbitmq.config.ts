import process from "node:process";

import { RABBIT_MQ_URI_REGEX } from "@common/constant";
import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber, envString } from "./schema.helpers";

export const rabbitmqConfigValidationSchema = z.object({
  RABBITMQ_URI: z.string().regex(RABBIT_MQ_URI_REGEX),
  RABBITMQ_EXCHANGE: envString(),
  RABBITMQ_DEFAULT_PREFETCH: envNumber(),
});

export const rabbitmq = registerAs("rabbitmq", () => ({
  url: process.env.RABBITMQ_URI,
  exchange: process.env.RABBITMQ_EXCHANGE,
  prefetchCount: process.env.RABBITMQ_DEFAULT_PREFETCH,
}));
