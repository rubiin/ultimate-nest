import { IsUniqueConstraint } from "@common/validators";
import {
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
import { CategoryModule } from "@modules/category/category.module";
import { ChatModule } from "@modules/chat/chat.module";
import { HealthModule } from "@modules/health/health.module";
import { NewsLetterModule } from "@modules/newsletter/newsletter.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { TagsModule } from "@modules/tags/tags.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [
		AuthModule,
		PostModule,
		ProfileModule,
		NewsLetterModule,
		HealthModule,
		UserModule,
		ChatModule,
		TagsModule,
		CategoryModule,
		OrmModule,
		TwoFactorModule,
		NestRabbitModule,
		NestMailModule,
		NestConfigModule,
		NestPinoModule,
		NestI18nModule,
		NestCloudinaryModule,
		NestSentryModule,
		NestCaslModule,
		NestThrottlerModule,
		NestHttpModule,
		NestServeStaticModule,
		ScheduleModule.forRoot(),
	],
	providers: [IsUniqueConstraint],
})
export class SharedModule {}
