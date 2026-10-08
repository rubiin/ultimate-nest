import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envNumber } from "./schema.helpers";

export const throttleConfigValidationSchema = z.object({
  THROTTLE_TTL: envNumber(z.number().min(1)),
  THROTTLE_LIMIT: envNumber(),
});

export const throttle = registerAs("throttle", () => ({
  limit: process.env.THROTTLE_LIMIT,
  ttl: process.env.THROTTLE_TTL,
}));
