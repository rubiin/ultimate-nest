import process from "node:process";

import { JWT_EXPIRY_REGEX } from "@common/constant";
import { registerAs } from "@nestjs/config";
import { isNumber } from "helper-fns";
import { z } from "zod";

import { envString } from "./schema.helpers";

/**
 * NOTE:
 * Expiry can be either number or string
 * A numeric value is interpreted as a seconds count
 * if number, parse to string
 *
 */

export const jwtConfigValidationSchema = z.object({
  JWT_ACCESS_EXPIRY: z.string().regex(JWT_EXPIRY_REGEX),
  JWT_ALGORITHM: envString().optional(),
  JWT_REFRESH_EXPIRY: z.string().regex(JWT_EXPIRY_REGEX),
  JWT_SECRET: z.string().min(8),
  MAGIC_LINK_EXPIRY: z.string().regex(JWT_EXPIRY_REGEX),
});

export const jwt = registerAs("jwt", () => ({
  accessExpiry: isNumber(process.env.JWT_ACCESS_EXPIRY)
    ? +process.env.JWT_ACCESS_EXPIRY
    : process.env.JWT_ACCESS_EXPIRY,
  algorithm: process.env?.JWT_ALGORITHM ?? "HS256",
  magicLinkExpiry: isNumber(process.env.MAGIC_LINK_EXPIRY)
    ? +process.env.MAGIC_LINK_EXPIRY
    : process.env.MAGIC_LINK_EXPIRY,
  refreshExpiry: isNumber(process.env.JWT_REFRESH_EXPIRY)
    ? +process.env.JWT_REFRESH_EXPIRY
    : process.env.JWT_REFRESH_EXPIRY,
  secret: process.env.JWT_SECRET,
}));
