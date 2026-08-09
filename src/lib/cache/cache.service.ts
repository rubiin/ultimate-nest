import { CACHE_SERVICE, ICacheService } from "@nestjs-redisx/cache";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_SERVICE) private readonly cacheService: ICacheService) {}

  /**
   * Reset the cache.
   * @returns A promise that resolves to void.
   */
  async resetCache(): Promise<boolean> {
    await this.cacheService.clear();

    return true;
  }

  /**
   * Drop every cached response carrying a tag, leaving the rest of the cache
   * untouched.
   * @returns A promise that resolves to the number of dropped entries.
   */
  async invalidateTag(tag: string): Promise<number> {
    return this.cacheService.invalidateTags([tag]);
  }
}
