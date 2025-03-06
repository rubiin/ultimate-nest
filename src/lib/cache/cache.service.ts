import  { Cache } from "cache-manager"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * It deletes all cache keys that match the given regular expression
   * @param regexString - The regex string to match against the cache keys.
   * @returns A boolean value.
   */

  // TODO: Implement this method later
  // deleteMatch(regexString: string): Observable<boolean> {
  //   return from(this.cacheManager.stores.keys()).pipe(
  //     concatMap((keys: string[]) => {
  //       const regex = new RegExp(regexString, "i")
  //       const match = keys.filter((key: string) => regex.test(key))

  //       return from(match)
  //     }),
  //     concatMap((key: string) => {
  //       return from(this.cacheManager.del(key))
  //     }),
  //     toArray(),
  //     map(() => true),
  //   )
  // }

  /**
   * Reset the cache.
   * @returns A promise that resolves to void.
   */
  async resetCache(): Promise<boolean> {
    return this.cacheManager.clear()
  }
}
