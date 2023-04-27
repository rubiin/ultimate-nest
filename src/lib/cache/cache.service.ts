import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

	/**
	 * It deletes all cache keys that match the given regular expression
	 * @param {string} regexString - The regex string to match against the cache keys.
	 * @returns A boolean value.
	 */
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

	/**
	 * Reset the cache.
	 * @returns A promise that resolves to void.
	 */
	async resetCache(): Promise<void> {
		return this.cacheManager.reset();
	}
}
