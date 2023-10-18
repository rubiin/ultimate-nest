import { IsUniqueConstraint } from "@common/decorators/validation";
import { CustomThrottlerGuard } from "@common/guards";
import { ClearCacheInterceptor, HttpCacheInterceptor } from "@common/interceptors";
import { NestCacheModule } from "@lib/cache";
import { NestConfigModule } from "@lib/config/config.module";
import {
  NestCaslModule,
  NestCloudinaryModule,
  NestHttpModule,
  NestI18nModule,
  NestJwtModule,
  NestMailModule,
  NestSentryModule,
  NestServeStaticModule,
  NestThrottlerModule,
  OrmModule,
} from "@lib/index";
import { NestPinoModule } from "@lib/pino/pino.module";
import { NestRabbitModule } from "@lib/rabbit/rabbit.module";
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
    NestSentryModule,
    NestJwtModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    IsUniqueConstraint,
    // {
    //   provide: APP_INTERCEPTOR,  // TODO: fix sentry
    //   useClass: SentryInterceptor,
    // },
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
