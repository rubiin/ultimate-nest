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

export interface IConfig {
	throttle: ReturnType<typeof throttle>;
	redis: ReturnType<typeof redis>;
	database: ReturnType<typeof database>;
	app: ReturnType<typeof app>;
	rabbitmq: ReturnType<typeof rabbitmq>;
	jwt: ReturnType<typeof jwt>;
	twilio: ReturnType<typeof twilio>;
	cloudinary: ReturnType<typeof cloudinary>;
	mail: ReturnType<typeof mail>;
	facebookOauth: ReturnType<typeof facebookOauth>;
	googleOauth: ReturnType<typeof googleOauth>;
}
