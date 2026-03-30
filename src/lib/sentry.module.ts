import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SentryModule } from "@ntegral/nestjs-sentry";

@Global()
@Module({
  imports: [
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        dsn: configService.get("sentry.dsn", { infer: true }),
        environment: configService.get("sentry.environment", { infer: true }),
        debug: true,
        tracesSampleRate: 1,
      }),
    }),
  ],
  exports: [SentryModule],
})
export class NestSentryModule {}
