import {
	NestCacheModule, NestCaslModule, NestCloudinaryModule, NestConfigModule, NestI18nModule,
	NestMailModule, NestPinoModule,
	NestSentryModule, OrmModule
} from "@lib/index";
import { AuthModule } from "@modules/auth/auth.module";
import { HealthModule } from "@modules/health/health.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { RabbitModule } from "@modules/rabbit/rabbit.module";
import { UserModule } from "@modules/user/user.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";

@Module({
	imports: [
		AuthModule,
		UserModule,
		PostModule,
		ProfileModule,
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
		NestCaslModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "resources"),
			serveStaticOptions: {
				maxAge: 86_400, // 1 day
			},
		}),
	]
})
export class SharedModule {}
