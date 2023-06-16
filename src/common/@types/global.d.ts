import { User as UserEntity } from "@entities";
import { I18nTranslations as I18nTranslationTypes } from "@generated";
import { Config as ConfigInterface } from "@lib/config/config.interface";

export {};

declare global {
	namespace Express {
		export interface Request {
			user?: UserEntity;
			realIp: string;
		}
	}

	namespace NodeJS {
		interface ProcessEnv {
			APP_PORT: number;
			APP_PREFIX: string;
			APP_NAME: string;
			NODE_ENV:
				| "dev"
				| "development"
				| "stage"
				| "staging"
				| "test"
				| "testing"
				| "prod"
				| "production";
			API_URL: string;
			CLIENT_URL: string;
			SWAGGER_USER: string;
			ALLOWED_ORIGINS?: string;
			SWAGGER_PASSWORD: string;

			DB_HOST: string;
			DB_PORT: number;
			DB_USERNAME: string;
			DB_PASSWORD: string;
			DB_DATABASE: string;

			ENC_IV: string;
			ENC_KEY: string;

			JWT_ACCESS_EXPIRY: string;
			JWT_REFRESH_EXPIRY: string;
			JWT_SECRET: string;

			MAIL_HOST: string;
			MAIL_PASSWORD: string;
			MAIL_USERNAME: string;
			MAIL_PORT: number;
			MAIL_SERVER: string;
			MAIL_PREVIEW_EMAIL: boolean;
			MAIL_BCC_LIST?: string;
			MAIL_SENDER_EMAIL: string;
			MAIL_TEMPLATE_DIR: string;

			CLOUDINARY_CLOUD_NAME: string;
			CLOUDINARY_API_KEY: string;
			CLOUDINARY_API_SECRET: string;

			REDIS_TTL: number;
			REDIS_URI: string;

			RABBITMQ_URI: string;
			RABBITMQ_EXCHANGE: string;
			RABBITMQ_QUEUE: string;
			RABBITMQ_DEFAULT_PREFETCH: number;

			SENTRY_DSN: string;

			GOOGLE_CLIENT_ID: string;
			GOOGLE_CLIENT_SECRET: string;
			GOOGLE_CALLBACK_URL: string;

			FACEBOOK_CLIENT_ID: string;
			FACEBOOK_CLIENT_SECRET: string;
			FACEBOOK_CALLBACK_URL: string;

			THROTTLE_LIMIT: string;
			THROTTLE_TTL: number;
		}
	}

	export type I18nTranslations = I18nTranslationTypes;
	export type Configs = ConfigInterface;
}
