import { UseInterceptors, applyDecorators } from "@nestjs/common";
import { CacheKeyInterceptor } from "@common/interceptors";
import { NoCache } from "./nocache.decorator";

/**
 * Use this to override the default cache interceptor.
 * By default, Nest uses the request URL (in an HTTP app) or cache key
 * (in websockets and microservices apps, set through the @CacheKey() decorator)
 * to associate cache records with your endpoints. Nevertheless, sometimes you might want
 *  to set up tracking based on different factors, for example, using HTTP headers
 *  (e.g. Authorization to properly identify profile endpoints).
 * @returns A function that returns a decorator.
 */
export function ApplyCustomCache() {
  return applyDecorators(NoCache, UseInterceptors(CacheKeyInterceptor));
}
