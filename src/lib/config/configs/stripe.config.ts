import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const stripeonfigValidationSchema = {
  STRIPE_API_KEY: Joi.string().required(),
  STRIPE_ACCOUNT: Joi.string().required(),
  STRIPE_CONNECT: Joi.string().required(),
};

export const stripe = registerAs("stripe", () => ({
  apiKey: process.env.STRIPE_API_KEY,
  connect: process.env.STRIPE_CONNECT,
  account: process.env.STRIPE_ACCOUNT,
}));
