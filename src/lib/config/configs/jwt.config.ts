import { registerAs } from "@nestjs/config";
import Joi from "joi";

/**
 * NOTE:
 * JWT_ACCESS_EXPIRY can be either number or string
 * if number, parse to string
 *
 */

export const jwt = registerAs("jwt", () => ({
	secret: process.env.JWT_SECRET,
	accessExpiry: /^\d+$/.test(process.env.JWT_ACCESS_EXPIRY)
		? +process.env.JWT_ACCESS_EXPIRY
		: process.env.JWT_ACCESS_EXPIRY,
	refreshExpiry: +process.env.JWT_REFRESH_EXPIRY,
}));

export const jwtConfigValidationSchema = {
	JWT_SECRET: Joi.string().required().min(8),
	JWT_REFRESH_EXPIRY: Joi.number().required(),
	JWT_ACCESS_EXPIRY: Joi.string().required(),
};
