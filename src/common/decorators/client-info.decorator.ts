import type { ClientInfo } from "@common/@types";
import { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

/*
The `Client` decorator is used to get the caller's IP address and user agent.
*/
export const Client = createParamDecorator((_, context: ExecutionContext): ClientInfo => {
  const request = context.switchToHttp().getRequest<NestifyRequest>();

  return { ipAddress: request.ip, userAgent: request.headers?.["user-agent"] };
});
