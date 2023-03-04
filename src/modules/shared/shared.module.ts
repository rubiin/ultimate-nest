import { IsUniqueConstraint } from "@common/validators";
import {
	NestCacheModule,
	NestCaslModule,
	NestCloudinaryModule,
	NestConfigModule,
	NestHttpModule,
	NestI18nModule,
	NestMailModule,
	NestPinoModule,
	NestRabbitModule,
	NestSentryModule,
	NestServeStaticModule,
	NestThrottlerModule,
	OrmModule,
} from "@lib/index";
import { AuthModule } from "@modules/auth/auth.module";
import { ChatModule } from "@modules/chat/chat.module";
import { HealthModule } from "@modules/health/health.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { DevtoolsModule } from "@nestjs/devtools-integration";

@Module({
	imports: [
		AuthModule,
		PostModule,
		ProfileModule,
		HealthModule,
		UserModule,
		ChatModule,
		OrmModule,
		TwoFactorModule,
		NestRabbitModule,
		NestMailModule,
		NestConfigModule,
		NestPinoModule,
		NestI18nModule,
		NestCacheModule,
		NestCloudinaryModule,
		NestSentryModule,
		NestCaslModule,
		NestThrottlerModule,
		NestHttpModule,
		NestServeStaticModule,
		DevtoolsModule.register({
      http: process.env.NODE_ENV.startsWith("prod"),
    }),
	],
	providers: [IsUniqueConstraint],
})
export class SharedModule {}
