import { CustomThrottlerGuard } from "@common/guards"
import { ClearCacheInterceptor, HttpCacheInterceptor } from "@common/interceptors"
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
} from "@lib/index"
import { UserModule } from "@modules/user/user.module"
import { Module } from "@nestjs/common"
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { ScheduleModule } from "@nestjs/schedule"

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
    UserModule,
    ScheduleModule.forRoot(),
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
