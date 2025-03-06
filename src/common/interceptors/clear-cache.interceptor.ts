import  { CacheService } from "@lib/cache"
import  { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"
import  { Observable } from "rxjs"
import { Injectable } from "@nestjs/common"
import { from, of } from "rxjs"
import { tap } from "rxjs/operators"

/**
 *
 *  This interceptor is used to automatically clear the cache after a successful mutation.
 *
 */
@Injectable()
export class ClearCacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<NestifyResponse>()
        const request = context.switchToHttp().getRequest<NestifyRequest>()

        if (
          request.method !== "GET"
          && response.statusCode >= 200
          && response.statusCode < 300
        ) {
          return from(this.cacheService.resetCache())
        }

        return of()
      }),
    )
  }
}
