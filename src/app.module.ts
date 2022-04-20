import { roles } from "@common/constants/app.roles";
import { NestCacheModule } from "@lib/cache/cache.module";
import { NestCloudinaryModule } from "@lib/cloudinary";
import { NestConfigModule } from "@lib/config/config.module";
import { NestI18nModule } from "@lib/i18n/i18n.module";
import { NestMailModule } from "@lib/mailer";
import { OrmModule } from "@lib/orm/orm.module";
import { NestPinoModule } from "@lib/pino/pino.module";
import { NestSentryModule } from "@lib/sentry/sentry.module";
import { AuthModule } from "@modules/auth/auth.module";
import { PostModule } from "@modules/post/post.module";
import { RabbitModule } from "@modules/rabbit/rabbit.module";
import { UserModule } from "@modules/user/user.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { SentryInterceptor } from "@ntegral/nestjs-sentry";
import { AccessControlModule } from "nest-access-control";
import { join } from "node:path";
import { HealthModule } from "./modules/health/health.module";

@Module({
	imports: [
		AuthModule,
		UserModule,
		PostModule,
		HealthModule,
		NestConfigModule,
		OrmModule,
		RabbitModule,
		NestMailModule,
		NestPinoModule,
		HttpModule,
		NestI18nModule,
		NestCacheModule,
		NestCloudinaryModule,
		NestSentryModule,
		AccessControlModule.forRoles(roles),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "resources"),
			serveStaticOptions: {
				maxAge: 86_400, // 1 day
			},
		}),
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useValue: new SentryInterceptor(),
		},
	],
})
export class AppModule {}
