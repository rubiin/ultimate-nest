import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { TwilioModule } from "./twilio.module";

@Module({
	imports: [
		TwilioModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService) => ({
				isGlobal: true,
				accountSid: configService.get("twilio.accountSid"),
				authToken: configService.get("twilio.authToken"),
				from: configService.get("twilio.from"),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [TwilioModule],
})
export class NestTwilioModule {}
