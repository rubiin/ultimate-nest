import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ThrottlerModule } from "@nestjs/throttler"

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        ttl: configService.get("throttle.ttl", { infer: true }),
        limit: configService.get("throttle.limit", { infer: true }),
        ignoreUserAgents: [/nestify/i],
        storage: new ThrottlerStorageRedisService(configService.getOrThrow("redis", { infer: true })),
        throttlers: [],
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class NestThrottlerModule {}
