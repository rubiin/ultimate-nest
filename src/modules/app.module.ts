import { SWAGGER_API_ENDPOINT } from "@common/constant";
import {
  AuditContextMiddleware,
  ClearCacheMiddleware,
  RealIpMiddleware,
} from "@common/middlewares";
import { applyRawBodyOnlyTo } from "@golevelup/nestjs-webhooks";
import { AppController } from "@modules/app.controller";
import { AuthModule } from "@modules/auth/auth.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { SharedModule } from "@modules/shared/shared.module";
import { TagsModule } from "@modules/tags/tags.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { UserModule } from "@modules/user/user.module";
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
      .apply(RealIpMiddleware, AuditContextMiddleware, ClearCacheMiddleware)
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
