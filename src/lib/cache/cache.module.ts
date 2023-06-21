import { NestConfigModule } from "@lib/config/config.module";
import { CacheModule, CacheStore } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

import { CacheService } from "./cache.service";

@Module({
	imports: [
		CacheModule.registerAsync<any>({
			imports: [NestConfigModule],
			isGlobal: true,
			useFactory: async (configService: ConfigService<Configs, true>) => {
				const store = await redisStore({
					url: configService.get("redis.url", { infer: true }),
					database: 0,
					isolationPoolOptions: {
						min: 1,
						max: 10,
					},
				});

				return {
					store: store as unknown as CacheStore,
					ttl: configService.get("redis.ttl", { infer: true }), // 3 minutes (milliseconds)
				};
			},
			inject: [ConfigService],
		}),
	],
	exports: [CacheModule, CacheService],
	providers: [CacheService],
})
export class NestCacheModule {}
