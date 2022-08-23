import { registerAs } from "@nestjs/config";

export const app = registerAs("app", () => ({
	port: +process.env.APP_PORT,
	prefix: process.env.APP_PREFIX,
	sentryDsn: process.env.SENTRY_DSN,
	swaggerUser: process.env.SWAGGER_USER,
	swaggerPass: process.env.SWAGGER_PASSWORD,
}));
