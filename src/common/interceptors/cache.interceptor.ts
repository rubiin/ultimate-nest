import { IGNORE_CACHING_META } from "@common/constant";
import { CACHE_KEY_METADATA, CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

/* If the ignoreCaching metadata is set to true, then the request will not be cached. */

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    const ignoreCaching: boolean = this.reflector.get(IGNORE_CACHING_META, context.getHandler());

    return !ignoreCaching && request.method === "GET";
  }

  /**
   * Global cache key: per-user GETs are keyed by caller + URL so a response from one caller is
   * not replayed to the next. Public routes (no authenticated user) fall back to the URL.
   */
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    if (!this.isRequestCacheable(context)) return undefined;

    const userKey = request.user?.id != null ? `:user:${request.user.id}` : "";
    const url = request.originalUrl ?? request.url;

    return `${url}${userKey}`;
  }
}

/* This interceptor is useful when  sometimes you might want to set up tracking based on different factors, for example, using HTTP headers (e.g. Authorization to properly identify profile endpoint */
@Injectable()
export class CacheKeyInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const cacheMetadata = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    const request = context.getArgByIndex<NestifyRequest>(0);

    if (cacheMetadata) return cacheMetadata;

    if (!this.isRequestCacheable(context)) return undefined;

    // Per-user GETs must be keyed by caller + URL, otherwise `GET /users` or `GET /profile`
    // is replayed to whoever asks next. Absent a user (public routes) fall back to the URL.
    const userKey = request.user?.id != null ? `:user:${request.user.id}` : "";

    // `CacheInterceptor` declares `httpAdapterHost` but never assigns it, so reading it
    // threw. The request already carries the path and query string.
    return `${request.originalUrl ?? request.url}${userKey}`;
  }
}
