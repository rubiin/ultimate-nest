import { IGNORE_CACHING_META } from "@common/constant";
import { CacheInterceptor } from "@nestjs/cache-manager";
import {ExecutionContext, Injectable } from "@nestjs/common";

/* If the ignoreCaching metadata is set to true, then the request will not be cached. */

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
	protected isRequestCacheable(context: ExecutionContext): boolean {
		const http = context.switchToHttp();
		const request = http.getRequest();

		const ignoreCaching: boolean = this.reflector.get(
			IGNORE_CACHING_META,
			context.getHandler(),
		);

		return !ignoreCaching && request.method === "GET";
	}
}
