import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";
import { JWT_EXPIRY_REGEX } from "@common/constant";

/**
 * NOTE:
 * Expiry can be either number or string
 * A numeric value is interpreted as a seconds count
 * if number, parse to string
 *
 */

export const jwtConfigValidationSchema = {
  JWT_SECRET: Joi.string().required().min(8),
  JWT_ALGORITHM: Joi.string().optional(),
  JWT_REFRESH_EXPIRY: Joi.string().regex(JWT_EXPIRY_REGEX).required(),
  JWT_ACCESS_EXPIRY: Joi.string().regex(JWT_EXPIRY_REGEX).required(),
  MAGIC_LINK_EXPIRY: Joi.string().regex(JWT_EXPIRY_REGEX).required(),
};

export const jwt = registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET,
  algorithm: process.env?.JWT_ALGORITHM ?? "HS256",
  accessExpiry: /^\d+$/.test(process.env.JWT_ACCESS_EXPIRY)
    ? +process.env.JWT_ACCESS_EXPIRY
    : process.env.JWT_ACCESS_EXPIRY,
  refreshExpiry: /^\d+$/.test(process.env.JWT_REFRESH_EXPIRY)
    ? +process.env.JWT_REFRESH_EXPIRY
    : process.env.JWT_REFRESH_EXPIRY,
  magicLinkExpiry: /^\d+$/.test(process.env.MAGIC_LINK_EXPIRY)
    ? +process.env.MAGIC_LINK_EXPIRY
    : process.env.MAGIC_LINK_EXPIRY,
}));
