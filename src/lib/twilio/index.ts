import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { TwilioModule } from "./twilio.module";

@Module({
	imports: [
		TwilioModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService<Configs, true>) => ({
				isGlobal: true,
				accountSid: configService.get("twilio.accountSid", { infer: true }),
				authToken: configService.get("twilio.authToken", { infer: true }),
				from: configService.get("twilio.from", { infer: true }),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [TwilioModule],
})
export class NestTwilioModule {}
