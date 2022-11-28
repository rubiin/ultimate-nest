import { NestConfigModule } from "@lib/config/config.module";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { TwilioModule } from "./twilio.module";

@Global()
@Module({
	imports: [
		TwilioModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService) => ({
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
