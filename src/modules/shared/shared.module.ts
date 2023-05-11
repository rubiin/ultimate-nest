import { IsUniqueConstraint } from "@common/decorators";
import { NestCaslModule } from "@lib/casl";
import { NestConfigModule } from "@lib/config";
import {
	NestCloudinaryModule,
	NestHttpModule,
	NestI18nModule,
	NestSentryModule,
	NestServeStaticModule,
	NestThrottlerModule,
	OrmModule,
} from "@lib/index";
import { NestMailModule } from "@lib/mailer";
import { NestPinoModule } from "@lib/pino";
import { NestRabbitModule } from "@lib/rabbit";
import { AuthModule } from "@modules/auth";
import { CategoryModule } from "@modules/category";
import { ChatModule } from "@modules/chat";
import { HealthModule } from "@modules/health";
import { PostModule } from "@modules/post";
import { ProfileModule } from "@modules/profile";
import { TagsModule } from "@modules/tags";
import { TwoFactorModule } from "@modules/twofa";
import { UserModule } from "@modules/user";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [
		AuthModule,
		PostModule,
		ProfileModule,
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
