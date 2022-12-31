import { SharedModule } from "@modules/shared/shared.module";
import { CacheInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { SentryInterceptor } from "@ntegral/nestjs-sentry";

@Module({
	imports: [SharedModule],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useValue: new SentryInterceptor(),
		},
		{
      provide:APP_INTERCEPTOR,
      useClass: CacheInterceptor
    },
	],
})
export class AppModule {}
