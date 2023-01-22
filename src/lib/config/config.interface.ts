import { MailModuleOptions } from "@lib/mailer/mailer.options";
import { TwilioModuleOptions } from "@lib/twilio/twilio.options";
import { ConnectionOptions } from "@mikro-orm/core";

interface Ouath {
	clientId: string;
	secret: string;
	callbackUrl: string;
}

export interface IConfig {
	throttle: {
		ttl: number;
		limit: number;
	};
	redis: {
		url: string;
		ttl: number;
	};
	database: ConnectionOptions;
	app: {
		port: string;
		prefix: string;
		name: string;
		clientUrl: string;
		allowedHosts: string;
		sentryDsn: string;
		swaggerUser: string;
		swaggerPass: string;
	};
	rabbitmq: {
		url: string;
		exchange: string;
	};
	jwt: {
		secret: string;
		accessExpiry: string;
		refreshExpiry: string;
	};
	twilio: TwilioModuleOptions;
	cloudinary: {
		cloud_name: string;
		api_key: string;
		api_secret: string;
	};
	mail: MailModuleOptions & { senderEmail: string };
	facebookOauth: Ouath;
	googleOauth: Ouath;
}
