import { applyRawBodyOnlyTo } from "@golevelup/nestjs-webhooks";
import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { SentryInterceptor } from "@ntegral/nestjs-sentry";
import { CustomThrottlerGuard } from "@common/guards";
import { ClearCacheInterceptor, HttpCacheInterceptor } from "@common/interceptors";
import { ClearCacheMiddleware, RealIpMiddleware } from "@common/middlewares";
import { NestCacheModule } from "@lib/cache";
import { SharedModule } from "@modules/shared/shared.module";
import { AppController } from "app.controller";
import { SWAGGER_API_ENDPOINT } from "@common/constant";

const stripeWebhookPath = "stripe/webhook";
const excludedPaths = [stripeWebhookPath, SWAGGER_API_ENDPOINT];

@Module({
  controllers: [AppController],
  imports: [SharedModule, NestCacheModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClearCacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      path: stripeWebhookPath,
      method: RequestMethod.ALL,
    });
    consumer
      .apply(RealIpMiddleware, ClearCacheMiddleware)
      .exclude(
        ...excludedPaths.map(path => ({
          path,
          method: RequestMethod.ALL,
        })),
      )
      .forRoutes({
        path: "*",
        method: RequestMethod.ALL,
      });
  }
}
