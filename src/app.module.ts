import { CustomThrottlerGuard } from "@common/guards";
import { CustomCacheInterceptor } from "@common/interceptors";
import { RealIpMiddleware } from "@common/middlewares/ip.middleware";
import { SharedModule } from "@modules/shared/shared.module";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { SentryInterceptor } from "@ntegral/nestjs-sentry";

@Module({
	imports: [SharedModule],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useValue: new SentryInterceptor(),
		},
		{
			provide: APP_GUARD,
			useClass: CustomThrottlerGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: CustomCacheInterceptor,
		},
	],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RealIpMiddleware)
      .forRoutes({
				path: "*",
				method: RequestMethod.ALL,
			});
  }
}
