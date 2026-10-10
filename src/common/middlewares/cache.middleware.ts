import { CacheService } from "@lib/cache/cache.service";
import { HelperService } from "@common/helpers";
import { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

/**
 * Clears the cache when `?clearCache=true` is present.
 *
 * In production the parameter is ignored unless the caller supplies the configured admin token,
 * so an anonymous request cannot wipe the whole keyspace (audit item #1).
 */
@Injectable()
export class ClearCacheMiddleware implements NestMiddleware {
  constructor(private readonly cacheService: CacheService) {}

  async use(request: NestifyRequest, _response: NestifyResponse, next: NestifyNextFunction) {
    if (request.query?.clearCache !== "true") return next();

    if (
      HelperService.isProd() &&
      request.query?.clearCacheToken !== process.env.CACHE_CLEAR_TOKEN
    ) {
      return next();
    }

    await this.cacheService.resetCache();
    next();
  }
}
