import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

	async deleteMatch(regexString: string): Promise<boolean> {
		const keys = await this.cacheManager.store.keys();

		const regex = new RegExp(regexString, "i");

		const match = keys.filter((key: string) => regex.test(key));

		if (match.length > 0) {
			const promiseQueue = [];

			for (const keys of match) {
				promiseQueue.push(this.cacheManager.del(keys));
			}

			await Promise.all(promiseQueue);
		}

		return true;
	}
}
