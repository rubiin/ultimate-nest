import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { CacheService } from "./cache.service";

@Global()
@Module({
  exports: [CacheModule, CacheService],
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        store: createKeyv(configService.getOrThrow("redis", { infer: true })),
      }),
    }),
  ],
  providers: [CacheService],
})
export class NestCacheModule {}
