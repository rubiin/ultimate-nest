
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

@Module({
	imports: [
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				ttl: config.get("throttle.ttl"),
				limit: config.get("throttle.limit"),
				ignoreUserAgents: [/nestify/i],
				storage: new ThrottlerStorageRedisService(config.get("redis.uri")),
			}),
		}),
	],
	exports: [ThrottlerModule],
})
export class NestThrottlerModule {}
