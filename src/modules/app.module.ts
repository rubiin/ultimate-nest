import type { MiddlewareConsumer, NestModule } from "@nestjs/common"
import { SWAGGER_API_ENDPOINT } from "@common/constant"
import { ClearCacheMiddleware, RealIpMiddleware } from "@common/middlewares"
import { applyRawBodyOnlyTo } from "@golevelup/nestjs-webhooks"
import { AppController } from "@modules/app.controller"
import { SharedModule } from "@modules/shared/shared.module"
import { Module, RequestMethod } from "@nestjs/common"

const stripeWebhookPath = "stripe/webhook"
const excludedPaths = [stripeWebhookPath, SWAGGER_API_ENDPOINT]

@Module({
  imports: [SharedModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      path: stripeWebhookPath,
      method: RequestMethod.ALL,
    })
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
      })
  }
}
