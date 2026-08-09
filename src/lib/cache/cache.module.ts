import { CachePlugin } from "@nestjs-redisx/cache";
import { RedisModule } from "@nestjs-redisx/core";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { CacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      plugins: [
        CachePlugin.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService<Configs, true>) => ({
            l2: { defaultTtl: configService.getOrThrow("redis.ttl", { infer: true }) },
          }),
        }),
      ],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const { host, port, username, password } = configService.getOrThrow("redis", {
          infer: true,
        });

        return { clients: { type: "single" as const, host, port, username, password } };
      },
    }),
  ],
  exports: [CacheService],
  providers: [CacheService],
})
export class NestCacheModule {}
