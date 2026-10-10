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
  NestThrottlerModule,
  OrmModule,
} from "@lib/index";
import { AuthModule } from "@modules/auth/auth.module";
import { PostModule } from "@modules/post/post.module";
import { ProfileModule } from "@modules/profile/profile.module";
import { TagsModule } from "@modules/tags/tags.module";
import { TwoFactorModule } from "@modules/twofa/twofa.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [
    NestConfigModule,
    NestMailModule,
    NestPinoModule,
    NestI18nModule,
    NestCloudinaryModule,
    NestCacheModule,
    NestCaslModule,
    NestThrottlerModule,
    NestRabbitModule,
    NestHttpModule,
    NestJwtModule,
    OrmModule,
    AuthModule,
    PostModule,
    ProfileModule,
    UserModule,
    TagsModule,
    TwoFactorModule,
  ],
  providers: [
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
