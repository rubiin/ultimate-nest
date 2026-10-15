import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Clears the cache.
   *
   * Scoped to the redis namespace: only `<namespace>::*` keys are deleted, so this cannot
   * remove entries belonging to another app sharing the database.
   * @returns A promise that resolves to void.
   */
  async resetCache(): Promise<boolean> {
    return this.cacheManager.clear();
  }
}
