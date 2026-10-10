import { SWAGGER_API_ENDPOINT } from "@common/constant";
import {
  AuditContextMiddleware,
  ClearCacheMiddleware,
  RealIpMiddleware,
} from "@common/middlewares";
import { applyRawBodyOnlyTo } from "@golevelup/nestjs-webhooks";
import { AppController } from "@modules/app.controller";
import { SharedModule } from "@modules/shared/shared.module";
import { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module, RequestMethod } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

const stripeWebhookPath = "stripe/webhook";
const excludedPaths = [stripeWebhookPath, SWAGGER_API_ENDPOINT];

@Module({
  imports: [
    SharedModule,
    // Root of the scheduler: `forRoot` belongs in the composition root, not in a shared
    // module that other feature modules import.
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      path: stripeWebhookPath,
      method: RequestMethod.ALL,
    });
    consumer
      .apply(RealIpMiddleware, AuditContextMiddleware, ClearCacheMiddleware)
      .exclude(
        ...excludedPaths.map((path) => ({
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
