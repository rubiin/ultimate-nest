import { NestConfigModule } from "@lib/config/config.module";
import { CacheModule, Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";
import { CacheService } from "./cache.service";

@Global()
@Module({
	imports: [
		CacheModule.registerAsync({
			imports: [NestConfigModule],
			useFactory: async (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get("redis.host"),
				port: configService.get<number>("redis.port", 6379),
				auth_pass: configService.get("redis.password"),
				ttl: configService.get<number>("redis.ttl", 10),
				db: 0,
			}),
			inject: [ConfigService],
		}),
	],
	exports: [CacheModule, CacheService],
	providers: [CacheService],
})
export class NestCacheModule {}
