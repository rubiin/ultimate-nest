import { CustomThrottlerGuard } from "@common/guards";
import { ClearCacheInterceptor, HttpCacheInterceptor } from "@common/interceptors";
import { ClearCacheMiddleware, RealIpMiddleware } from "@common/middlewares";
import { applyRawBodyOnlyTo } from "@golevelup/nestjs-webhooks";
import { NestCacheModule } from "@lib/cache";
import { SharedModule } from "@modules/shared/shared.module";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { SentryInterceptor } from "@ntegral/nestjs-sentry";

@Module({
	imports: [SharedModule, NestCacheModule],
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
			method: RequestMethod.ALL,
			path: "stripe/webhook",
		});
		consumer
			.apply(RealIpMiddleware)
			.forRoutes({
				path: "*",
				method: RequestMethod.ALL,
			})
			.apply(ClearCacheMiddleware)
			.forRoutes({
				path: "*",
				method: RequestMethod.GET,
			});
	}
}
