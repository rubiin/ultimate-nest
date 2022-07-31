import {Injectable, NestMiddleware} from "@nestjs/common";
import {getClientIp} from "@supercharge/request-ip";

@Injectable()
export class RealIpMiddleware implements NestMiddleware {
    use(request: any, _response: any, next: () => void) {
        request.ip = getClientIp(request);
        next();
    }
}
