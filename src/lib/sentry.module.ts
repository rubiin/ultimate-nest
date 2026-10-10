import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SentryModule } from "@ntegral/nestjs-sentry";

@Global()
@Module({
  exports: [SentryModule],
  imports: [
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        debug: true,
        dsn: configService.get("sentry.dsn", { infer: true }),
        environment: configService.get("sentry.environment", { infer: true }),
        tracesSampleRate: 1,
      }),
    }),
  ],
})
export class NestSentryModule {}
