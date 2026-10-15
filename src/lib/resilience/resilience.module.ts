import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ResilienceModule } from "@nestjs/resilience";

import { ResilienceLogger } from "./resilience.logger";

/**
 * Registered once, from `SharedModule`. It brings one app-wide interceptor,
 * which is a no-op for handlers without resilience decorators apart from
 * mapping resilience errors to 503/504.
 *
 * Presets are named per dependency rather than per route, because a breaker is
 * per dependency: one Cloudinary outage should shed avatar uploads wherever they
 * are started, and the cron and the consumers share what the routes learn.
 */
@Module({
  exports: [ResilienceLogger],
  imports: [
    ResilienceModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const breaker = configService.get("resilience.breaker", { infer: true });
        const retry = configService.get("resilience.retry", { infer: true });
        const upload = configService.get("resilience.upload", { infer: true });
        const timeout = configService.get("resilience.timeout", { infer: true });

        return {
          presets: {
            cloudinary: {
              bulkhead: { maxConcurrent: upload.maxConcurrent, maxQueue: upload.maxQueue },
              circuitBreaker: { ...breaker },
              timeout,
            },
            mail: { circuitBreaker: { ...breaker }, timeout },
            // Publishing is the one outbound call here worth retrying: the
            // consumer deduplicates on the reference it carries, and the routes
            // that publish also write rows, so nothing else may be re-run.
            rabbitmq: { circuitBreaker: { ...breaker }, retry: { ...retry }, timeout },
          },
        };
      },
    }),
  ],
  providers: [ResilienceLogger],
})
export class NestResilienceModule {}
