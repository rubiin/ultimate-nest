import { NestConfigModule } from "@lib/config/config.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SentryModule } from "@ntegral/nestjs-sentry";

@Module({
	imports: [
		SentryModule.forRootAsync({
			imports: [NestConfigModule],
			useFactory: async (configService: ConfigService) => ({
				dsn: configService.get("app.sentryDsn"),
				debug: true,
				environment: "development",
				tracesSampleRate: 1,
			}),
			inject: [ConfigService],
		}),
	],
	exports: [SentryModule],
})
export class NestSentryModule {}
