import { SWAGGER_API_ENDPOINT } from "@common/constant/index.js";
import { AuditContextMiddleware, RealIpMiddleware } from "@common/middlewares/index.js";
import { applyRawBodyOnlyTo } from "@golevelup/nestjs-webhooks";
import { AppController } from "@modules/app.controller.js";
import { AuthModule } from "@modules/auth/auth.module.js";
import { PostModule } from "@modules/post/post.module.js";
import { ProfileModule } from "@modules/profile/profile.module.js";
import { SharedModule } from "@modules/shared/shared.module.js";
import { TagsModule } from "@modules/tags/tags.module.js";
import { TwoFactorModule } from "@modules/twofa/twofa.module.js";
import { UserModule } from "@modules/user/user.module.js";
import { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Module, RequestMethod } from "@nestjs/common";

const stripeWebhookPath = "stripe/webhook";
const excludedPaths = [stripeWebhookPath, SWAGGER_API_ENDPOINT];

@Module({
  controllers: [AppController],
  imports: [
    SharedModule,
    // Features live here, next to the app, not inside the infrastructure module.
    AuthModule,
    PostModule,
    ProfileModule,
    UserModule,
    TagsModule,
    TwoFactorModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    applyRawBodyOnlyTo(consumer, {
      method: RequestMethod.ALL,
      path: stripeWebhookPath,
    });
    consumer
      .apply(RealIpMiddleware, AuditContextMiddleware)
      .exclude(
        ...excludedPaths.map((path) => ({
          method: RequestMethod.ALL,
          path,
        })),
      )
      .forRoutes({
        method: RequestMethod.ALL,
        path: "*",
      });
  }
}
