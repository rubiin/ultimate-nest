import type { CacheService } from "@lib/cache/cache.service"
import type { NestMiddleware } from "@nestjs/common"
import { Injectable } from "@nestjs/common"

// This middleware is used to clear the cache when the query parameter "clearCache" is present
@Injectable()
export class ClearCacheMiddleware implements NestMiddleware {
  constructor(private readonly cacheService: CacheService) {}

  async use(request: NestifyRequest, _response: NestifyResponse, next: NestifyNextFunction) {
    if (request.query?.clearCache === "true")
      await this.cacheService.resetCache()

    next()
  }
}
