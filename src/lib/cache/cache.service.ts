import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

	async deleteMatch(regex: RegExp): Promise<boolean> {
		const keys = await this.cacheManager.store.keys();

		const match = keys.filter((key: string) => regex.test(key));

		await this.cacheManager.store.del(match);

		return true;
	}
}
