import { MyCacheInterceptor } from "@common/interceptors";
import { SharedModule } from "@modules/shared/shared.module";
import { CacheInterceptor, Module } from "@nestjs/common";
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
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: MyCacheInterceptor,
		},
	],
})
export class AppModule {}
