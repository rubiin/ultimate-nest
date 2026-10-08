import process from "node:process";

import { registerAs } from "@nestjs/config";
import { z } from "zod";

import { envString } from "./schema.helpers";

export const stripeonfigValidationSchema = z.object({
  STRIPE_API_KEY: envString(),
  STRIPE_ACCOUNT: envString(),
  STRIPE_CONNECT: envString(),
});

export const stripe = registerAs("stripe", () => ({
  apiKey: process.env.STRIPE_API_KEY,
  connect: process.env.STRIPE_CONNECT,
  account: process.env.STRIPE_ACCOUNT,
}));
