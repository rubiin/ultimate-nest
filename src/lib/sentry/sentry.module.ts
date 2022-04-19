import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SentryModule } from "@ntegral/nestjs-sentry";

@Module({
	imports: [
		SentryModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: async (configService: ConfigService) => ({
				dsn: configService.get("sentry.dsn"),
				debug: true,
				environment: "dev",
				release: null,
			}),
			inject: [ConfigService],
		}),
	],
	exports: [SentryModule],
	providers: [],
})
export class NestSentryModule {}
