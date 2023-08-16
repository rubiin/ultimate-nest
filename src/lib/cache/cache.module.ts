import type { CacheStore } from "@nestjs/cache-manager";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-ioredis-yet";
import { CacheService } from "./cache.service";

import { NestConfigModule } from "@lib/config/config.module";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [NestConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          host: configService.get("redis.host"),
          port: configService.get("redis.port"),
          username: configService.get("redis.username"),
          password: configService.get("redis.password"),
          keepAlive: 120,
          ttl: configService.get("redis.ttl"),
        });

        return {
          store: store as unknown as CacheStore,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule, CacheService],
  providers: [CacheService],
})
export class NestCacheModule {}
