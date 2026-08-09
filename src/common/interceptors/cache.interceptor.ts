import { IGNORE_CACHING_META } from "@common/constant";
import { resourceCacheTag } from "@lib/cache/cache.constant";
import { CACHE_SERVICE, ICacheService } from "@nestjs-redisx/cache";
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { HttpAdapterHost, Reflector } from "@nestjs/core";
import { firstValueFrom, from, Observable } from "rxjs";

/* If the ignoreCaching metadata is set to true, then the request will not be cached. */

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_SERVICE) protected readonly cacheService: ICacheService,
    protected readonly reflector: Reflector,
    protected readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = this.trackBy(context);

    if (!key) return next.handle();

    /* getOrSet keeps concurrent misses on the same key down to a single call of
    the route handler, so a cold key cannot stampede the database. */
    return from(
      this.cacheService.getOrSet(key, () => firstValueFrom(next.handle()), {
        tags: [resourceCacheTag(context)],
      }),
    );
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    const ignoreCaching: boolean = this.reflector.get(IGNORE_CACHING_META, context.getHandler());

    return !ignoreCaching && request.method === "GET";
  }

  protected trackBy(context: ExecutionContext): string | undefined {
    if (!this.isRequestCacheable(context)) return undefined;

    const request = context.switchToHttp().getRequest<NestifyRequest>();

    return this.httpAdapterHost.httpAdapter.getRequestUrl(request);
  }
}

/* This interceptor is useful when  sometimes you might want to set up tracking based on different factors, for example, using HTTP headers (e.g. Authorization to properly identify profile endpoint */
@Injectable()
export class CacheKeyInterceptor extends HttpCacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    if (request.method !== "GET") return undefined;

    const userId = request.user!.idx;

    return `${this.httpAdapterHost.httpAdapter.getRequestUrl(request)}_${userId}`;
  }
}
