import { NestConfigModule } from "@lib/config/config.module";
import { CacheModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";
import { CacheService } from "./cache.service";

@Module({
	imports: [
		CacheModule.registerAsync({
			imports: [NestConfigModule],
			useFactory: async (configService: ConfigService) => ({
				store: redisStore,
				url: configService.get("redis.url"),
				db: 0,
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CacheModule, CacheService],
	providers: [CacheService],
})
export class NestCacheModule {}
