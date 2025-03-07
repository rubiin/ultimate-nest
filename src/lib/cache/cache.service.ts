import  { Cache } from "cache-manager"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable } from "@nestjs/common"
import { toArray, map,concatMap, from, Observable } from "rxjs"

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}




  /**
   * Reset the cache.
   * @returns A promise that resolves to void.
   */
  async resetCache(): Promise<boolean> {
    return this.cacheManager.clear()
  }
}
