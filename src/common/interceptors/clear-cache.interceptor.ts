import { CacheService } from "@lib/cache";
import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { concat, from, Observable, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

/**
 * Clears the cache after a successful mutation (non-GET, 2xx response).
 *
 * The previous version used `tap` with a discarded `from(resetCache())` Observable, so the
 * clear promise was never awaited and Redis failures became unhandled rejections while the
 * handler still returned 200. `switchMap` now awaits the clear and propagates its errors so a
 * cache-clear failure surfaces to the caller instead of being swallowed.
 */
@Injectable()
export class ClearCacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      switchMap((result) => {
        const response = context.switchToHttp().getResponse<NestifyResponse>();

        if (
          result instanceof Observable ||
          result instanceof Promise ||
          (result !== null && typeof result === "object" && "subscribe" in result)
        ) {
          // The handler returned a lazy Observable/Promise (e.g. a streaming response). Defer the
          // cache clear until the body has actually been sent, and mirror whatever it emits/rejects.
          return (result as Observable<unknown>).pipe(
            switchMap(() => this.clearIfMutation(context, response)),
            catchError(() => of(result)),
          );
        }

        // Synchronous handler result: clear the cache (if this was a successful mutation) and
        // pass the result through. `concat` keeps the result emission even when the clear emits
        // nothing (non-mutation), so `lastValueFrom` never sees an empty sequence.
        return concat(this.clearIfMutation(context, response), of(result));
      }),
    );
  }

  private clearIfMutation(context: ExecutionContext, response: NestifyResponse): Observable<void> {
    const request = context.switchToHttp().getRequest<NestifyRequest>();

    if (request.method !== "GET" && response.statusCode >= 200 && response.statusCode < 300) {
      return from(this.cacheService.resetCache()).pipe(map(() => undefined));
    }

    return of();
  }
}
