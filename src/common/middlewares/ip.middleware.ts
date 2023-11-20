import type { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { getClientIp } from "@supercharge/request-ip";

@Injectable()
export class RealIpMiddleware implements NestMiddleware {
  use(request: NestifyRequest, _response: NestifyResponse, next: NestifyNextFunction) {
    request.realIp = getClientIp(request)!;
    next();
  }
}
