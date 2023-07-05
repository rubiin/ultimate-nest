import { CacheKeyInterceptor } from "@common/interceptors";
import { applyDecorators, UseInterceptors } from "@nestjs/common";

import { NoCache } from "./nocache.decorator";

/**
 * @description use this to override the default cache interceptor.
 * By default, Nest uses the request URL (in an HTTP app) or cache key
 * (in websockets and microservices apps, set through the @CacheKey() decorator)
 * to associate cache records with your endpoints. Nevertheless, sometimes you might want
 *  to set up tracking based on different factors, for example, using HTTP headers
 *  (e.g. Authorization to properly identify profile endpoints).
 *
 */
export const ApplyCustomCache = () => {
	return applyDecorators(NoCache, UseInterceptors(CacheKeyInterceptor));
};
