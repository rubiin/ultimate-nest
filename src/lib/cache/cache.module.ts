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
				host: configService.get<string>("redis.host"),
				port: configService.get<string>("redis.port"),
				ttl: configService.get<number>("redis.ttl"),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CacheModule, CacheService],
	providers: [CacheService],
})
export class NestCacheModule {}
