import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { CacheService } from "./cache.service.js";

@Global()
@Module({
  exports: [CacheModule, CacheService],
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService<Configs, true>) => {
        const redisConfig = configService.getOrThrow("redis", { infer: true });
        const redisStore = createKeyv(redisConfig, { namespace: redisConfig.namespace });
        redisStore.on("error", (err) => console.error("Redis error:", err));

        return {
          // Entries expire instead of living until the next wipe. A short default keeps
          // per-user replay exposure bounded even when a route forgets @CacheTTL.
          ttl: 5 * 60 * 1000,
          // The namespace scopes every key to `<namespace>::<key>`, so `resetCache()` only
          // deletes this app's entries and never another tenant's keys in the same database.
          store: redisStore,
        };
      },
    }),
  ],
  providers: [CacheService],
})
export class NestCacheModule {}
