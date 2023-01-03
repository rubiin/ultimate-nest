import { NestConfigModule } from "@lib/config/config.module";
import { CacheModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";
import type { RedisClientOptions } from "redis";

import { CacheService } from "./cache.service";

@Module({
	imports: [
		CacheModule.registerAsync<any>({
			imports: [NestConfigModule],
			isGlobal: true,
			useFactory: async (configService: ConfigService) => {
				const store = await redisStore({
					url: configService.get("redis.uri"),
					ttl: configService.get<number>("redis.ttl", 10),
					database: 0,
					isolationPoolOptions: {
						min: 1,
						max: 10,
					},
				});
				return {
					store: () => store,
				};
			},
			inject: [ConfigService],
		}),
	],
	exports: [CacheModule, CacheService],
	providers: [CacheService],
})
export class NestCacheModule {}
