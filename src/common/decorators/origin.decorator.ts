import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

/*
The `Origin` decorator is used to get the origin of the request.
*/
export const Origin = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    return context.switchToHttp().getRequest<NestifyRequest>().headers?.origin;
  },
);
