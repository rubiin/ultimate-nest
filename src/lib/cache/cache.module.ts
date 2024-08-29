import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { RedisClientOptions } from "redis";
import { CacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        store: await redisStore({
          ttl: configService.get("redis.ttl", { infer: true }),
          url: configService.get("redis.url", { infer: true }),
          socket: {
            host: configService.get("redis.host", { infer: true }),
            port: configService.get("redis.port", { infer: true }),
            keepAlive: 120,
          },
        }),
      }),
      isGlobal: true,
    }),
  ],
  exports: [CacheModule, CacheService],
  providers: [CacheService],
})
export class NestCacheModule {}
