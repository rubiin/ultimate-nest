import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Configs, true>) => ({
        ttl: config.get("throttle.ttl", { infer: true }),
        limit: config.get("throttle.limit", { infer: true }),
        ignoreUserAgents: [/nestify/i],
        storage: new ThrottlerStorageRedisService(config.get("redis.url", { infer: true })),
        throttlers: [],
      }),
    }),
  ],
  exports: [ThrottlerModule],
})
export class NestThrottlerModule {}
