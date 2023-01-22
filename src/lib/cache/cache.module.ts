import { IConfig } from "@lib/config/config.interface";
import { NestConfigModule } from "@lib/config/config.module";
import { CacheModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";

import { CacheService } from "./cache.service";

@Module({
	imports: [
		CacheModule.registerAsync<any>({
			imports: [NestConfigModule],
			isGlobal: true,
			useFactory: async (configService: ConfigService<IConfig, true>) => {
				const store = await redisStore({
					url: configService.get("redis.url", { infer: true }),
					ttl: configService.get("redis.ttl", { infer: true }),
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
