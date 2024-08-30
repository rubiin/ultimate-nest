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
  NestThrottlerModule
} from "@lib/index";
import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

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
    NestHttpModule,
    NestJwtModule,
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
