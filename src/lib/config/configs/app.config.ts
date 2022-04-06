import { registerAs } from "@nestjs/config";

export const app = registerAs("app", () => ({
	port: +process.env.APP_PORT,
	sentryDsn: +process.env.SENTRY_DSN,
}));
