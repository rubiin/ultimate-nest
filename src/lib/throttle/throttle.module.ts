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
				ttl: config.get<number>("throttle.ttl"),
				limit: config.get<number>("throttle.limit"),
				ignoreUserAgents: [/nestify/i],
				storage: new ThrottlerStorageRedisService(config.get<string>("redis.uri")),
			}),
		}),
	],
	exports: [ThrottlerModule],
})
export class NestThrottlerModule {}
