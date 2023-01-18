import { CustomThrottlerGuard } from "@common/guards";
import { CustomCacheInterceptor } from "@common/interceptors";
import { SharedModule } from "@modules/shared/shared.module";
import { Module } from "@nestjs/common";
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
		}
	],
})
export class AppModule {}
