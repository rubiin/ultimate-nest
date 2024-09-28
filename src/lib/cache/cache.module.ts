import { CacheModule } from "@nestjs/cache-manager"
import { Global, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { redisStore } from "cache-manager-ioredis-yet"
import { CacheService } from "./cache.service"

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configs, true>) => ({
        store: await redisStore(configService.getOrThrow("redis", { infer: true })),
      }),
      isGlobal: true,
    }),
  ],
  exports: [CacheModule, CacheService],
  providers: [CacheService],
})
export class NestCacheModule { }
