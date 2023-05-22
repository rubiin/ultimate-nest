import { ConfigType } from "@nestjs/config";

import {
	app,
	cloudinary,
	database,
	facebookOauth,
	googleOauth,
	jwt,
	mail,
	rabbitmq,
	redis,
	throttle,
	twilio,
} from "./configs";

export interface Config {
	throttle: ConfigType<typeof throttle>;
	redis: ConfigType<typeof redis>;
	database: ConfigType<typeof database>;
	app: ConfigType<typeof app>;
	rabbitmq: ConfigType<typeof rabbitmq>;
	jwt: ConfigType<typeof jwt>;
	twilio: ConfigType<typeof twilio>;
	cloudinary: ConfigType<typeof cloudinary>;
	mail: ConfigType<typeof mail>;
	facebookOauth: ConfigType<typeof facebookOauth>;
	googleOauth: ConfigType<typeof googleOauth>;
}
