import { NestConfigModule } from "@lib/config/config.module";
import { CacheModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import redisStore from "cache-manager-redis-store";
import type { ClientOpts } from 'redis';
import { CacheService } from "./cache.service";

@Module({
	imports: [
		CacheModule.registerAsync<ClientOpts>({
			imports: [NestConfigModule],
			useFactory: async (configService: ConfigService) => ({
				store: redisStore,
				url: configService.get("redis.uri"),
				ttl: configService.get<number>("redis.ttl", 10),
				database: 0,
				isGlobal: true,
				isolationPoolOptions :{
					max: 10,
					min: 1,
				}
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CacheModule, CacheService],
	providers: [CacheService],
})
export class NestCacheModule {}
