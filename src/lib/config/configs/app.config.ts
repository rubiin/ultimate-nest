import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const app = registerAs("app", () => ({
	port: process.env.APP_PORT,
	env: process.env.NODE_ENV,
	prefix: process.env.APP_PREFIX,
	name: process.env.APP_NAME,
	clientUrl: process.env.CLIENT_URL,
	allowedHosts: process.env.ALLOWED_HOSTS,
	sentryDsn: process.env.SENTRY_DSN,
	swaggerUser: process.env.SWAGGER_USER,
	swaggerPass: process.env.SWAGGER_PASSWORD,
}));

export const appConfigValidationSchema = {
	NODE_ENV: Joi.string()
		.valid("dev", "prod", "development", "staging", "testing", "stage", "test", "production")
		.required(),
	APP_PORT: Joi.number().required(),
	APP_PREFIX: Joi.string().required(),
	APP_NAME: Joi.string().required(),
	CLIENT_URL: Joi.string().required(),
	ALLOWED_HOSTS: Joi.string().required(),
	SWAGGER_USER: Joi.string().required(),
	SWAGGER_PASSWORD: Joi.string().required(),
	SENTRY_DSN: Joi.string().required(),
};
