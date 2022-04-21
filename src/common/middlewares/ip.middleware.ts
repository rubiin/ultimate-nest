import { Injectable, NestMiddleware } from "@nestjs/common";
import requestIp from "@supercharge/request-ip";

@Injectable()
export class RealIpMiddleware implements NestMiddleware {
	use(request: any, response: any, next: () => void) {
		request.ip = requestIp.getClientIp(request);
		next();
	}
}
