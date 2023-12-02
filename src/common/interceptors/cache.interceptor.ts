import { CACHE_KEY_METADATA, CacheInterceptor } from "@nestjs/cache-manager";
import type { ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { IGNORE_CACHING_META } from "@common/constant";

/* If the ignoreCaching metadata is set to true, then the request will not be cached. */

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    const ignoreCaching: boolean = this.reflector.get(
      IGNORE_CACHING_META,
      context.getHandler(),
    );

    return !ignoreCaching && request.method === "GET";
  }
}

/* This interceptor is useful when  sometimes you might want to set up tracking based on different factors, for example, using HTTP headers (e.g. Authorization to properly identify profile endpoint */
@Injectable()
export class CacheKeyInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());

    const request = context.getArgByIndex<NestifyRequest>(0);
    const userId = request.user!.idx;

    if (!isHttpApp || cacheMetadata)
      return `${cacheMetadata}_${userId}`;

    if (!this.isRequestCacheable(context))
      return undefined;

    return `${httpAdapter.getRequestUrl(request)}_${userId}`;
  }
}
