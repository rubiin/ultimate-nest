import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import {
	app,
	cloudinary,
	database,
	facebookOauth,
	googleOauth,
	jwt,
	mail,
	rabbit,
	redis,
	throttle,
} from "./configs";
import { validationSchema } from "./validate.config";

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`env/.env.${process.env.NODE_ENV}`],
			load: [
				app,
				jwt,
				database,
				mail,
				redis,
				cloudinary,
				rabbit,
				googleOauth,
				facebookOauth,
				throttle,
			],
			cache: true,
			isGlobal: true,
			expandVariables: true,
			validationSchema: validationSchema,
			validationOptions: {
				abortEarly: true,
				debug: true,
			},
		}),
	],
	providers: [ConfigService],
	exports: [ConfigService],
})
export class NestConfigModule {}
