import type { User } from "@entities";
import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

/*
The `LoggedInUser` decorator is used to get the user object from the request object.
*/
export const LoggedInUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<NestifyRequest>();

  const user = request.user as User;

  return data ? user[data] : user;
});
