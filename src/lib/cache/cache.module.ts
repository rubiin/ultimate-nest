import { ConfigModule } from '@lib/config/config.module';
import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
	imports: [
		NestCacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				store: redisStore,
				host: configService.get<string>('redis.host'),
				port: configService.get<string>('redis.port'),
				ttl: configService.get<number>('redis.ttl'),
			}),
			inject: [ConfigService],
		}),
	],
	exports: [NestCacheModule, CacheService],
	providers: [CacheService],
})
export class CacheModule {}
