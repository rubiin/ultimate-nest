import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

export const ClientTimezone = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<NestifyRequest>();
  return request.headers["x-client-timezone"] || "Asia/Kathmandu";
});
