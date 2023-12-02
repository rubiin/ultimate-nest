import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const throttleConfigValidationSchema = {
  THROTTLE_TTL: Joi.number().min(1).required(),
  THROTTLE_LIMIT: Joi.number().required(),
};

export const throttle = registerAs("throttle", () => ({
  limit: process.env.THROTTLE_LIMIT,
  ttl: process.env.THROTTLE_TTL,
}));
