import requestIp from "@supercharge/request-ip";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RealIP = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();

		return requestIp.getClientIp(request);
	},
);
