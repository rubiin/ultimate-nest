import { IsUniqueConstraint } from "@common/decorators/validation";
import { CustomThrottlerGuard } from "@common/guards";
import { ClearCacheInterceptor, HttpCacheInterceptor } from "@common/interceptors";
import {
  NestCacheModule,
  NestCaslModule,
  NestCloudinaryModule,
  NestConfigModule,
  NestHttpModule,
  NestI18nModule,
  NestJwtModule,
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
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { TagsModule } from "@modules/tags/tags.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { SentryInterceptor } from "@travelerdev/nestjs-sentry";

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
    NestCacheModule,
    NestSentryModule,
    NestCaslModule,
    NestThrottlerModule,
    NestHttpModule,
    NestServeStaticModule,
    NestJwtModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    IsUniqueConstraint,
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new SentryInterceptor(),
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
export class SharedModule {}
