import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SentryModule } from '@ntegral/nestjs-sentry'
import { NestConfigModule } from '@lib/config/config.module'

@Module({
  imports: [
    SentryModule.forRootAsync({
      imports: [NestConfigModule],
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        dsn: configService.get('app.sentryDsn', { infer: true }),
        debug: true,
        environment: 'development',
        tracesSampleRate: 1,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [SentryModule],
})
export class NestSentryModule {}
