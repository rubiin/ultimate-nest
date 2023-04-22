import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const app = registerAs("app", () => ({
	port: process.env.APP_PORT,
	prefix: process.env.APP_PREFIX,
	env: process.env.NODE_ENV,
	url: process.env.API_URL,
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
	API_URL: Joi.string().uri().required(),
	APP_PREFIX: Joi.string().required().pattern(/^v\d+/).required().messages({
		"string.pattern.base": 'Version must start with "v" followed by a number',
	}),
	APP_NAME: Joi.string().required(),
	CLIENT_URL: Joi.string().uri().required(),
	ALLOWED_HOSTS: Joi.string().required(),
	SWAGGER_USER: Joi.string().required(),
	SWAGGER_PASSWORD: Joi.string().required(),
	SENTRY_DSN: Joi.string()
		.pattern(/https:\/\/[\da-f]{32}@o\d+\.ingest\.sentry\.io\/\d+/)
		.required()
		.messages({
			"string.pattern.base": "dsn must follow .ingest.sentry.io format",
		}),
};
