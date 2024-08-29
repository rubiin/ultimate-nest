import { Global, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/nestjs";
import { SentryModule } from "@sentry/nestjs/setup";
import { nodeProfilingIntegration } from '@sentry/profiling-node';


@Global()
@Module({
  imports: [
    SentryModule.forRoot()
  ],
  exports: [SentryModule],
})
export class NestSentryModule implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigService) { }

  onApplicationBootstrap() {

    // Ensure to call this before importing any other modules!
    Sentry.init({
      dsn: this.configService.get("sentry.sentryDsn", { infer: true }),
      environment: this.configService.get("sentry.environment", { infer: true }),
      debug: true,
      integrations: [
        // Add our Profiling integration
        nodeProfilingIntegration(),
      ],

      // Add Tracing by setting tracesSampleRate
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,

      // Set sampling rate for profiling
      // This is relative to tracesSampleRate
      profilesSampleRate: 1.0,
    });

  }

}
