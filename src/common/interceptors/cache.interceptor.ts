import { CacheInterceptor, ExecutionContext, Injectable, Logger } from "@nestjs/common";

/* If the ignoreCaching metadata is set to true, then the request will not be cached. */

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
	protected isRequestCacheable(context: ExecutionContext): boolean {
		const logger = new Logger("CacheInterceptor");
		const http = context.switchToHttp();
		const request = http.getRequest();

		const cache = request.query?.cache === "true";
		const ignoreCaching: boolean = this.reflector.get("ignoreCaching", context.getHandler());

		const isCacheable = cache || !ignoreCaching;

		return isCacheable && request.method === "GET";

	}
}
