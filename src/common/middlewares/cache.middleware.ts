import { CacheService } from "@lib/cache/cache.service";
import { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

/**
 * Clears the cache when `?clearCache=true` is present.
 *
 * No token is required: every key is written under the redis namespace, so the clear
 * SCANs `<namespace>::*` and is confined to this app's own entries.
 */
@Injectable()
export class ClearCacheMiddleware implements NestMiddleware {
  constructor(private readonly cacheService: CacheService) {}

  async use(request: NestifyRequest, _response: NestifyResponse, next: NestifyNextFunction) {
    if (request.query?.clearCache !== "true") return next();

    await this.cacheService.resetCache();
    next();
  }
}
