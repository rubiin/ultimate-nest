import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

// Optional integration: absent is valid, empty is not.
export const stripeConfigValidationSchema = z.object({
  STRIPE_ACCOUNT: envString().optional(),
  STRIPE_API_KEY: envString().optional(),
  STRIPE_CONNECT: envString().optional(),
});

export const stripe = registerAs("stripe", () => ({
  account: process.env.STRIPE_ACCOUNT,
  apiKey: process.env.STRIPE_API_KEY,
  connect: process.env.STRIPE_CONNECT,
}));
