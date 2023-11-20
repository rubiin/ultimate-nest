import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import type { User } from "@entities";

/*
The `LoggedInUser` decorator is used to get the user object from the request object.
*/
export const LoggedInUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
  let request = context.switchToHttp().getRequest<NestifyRequest>();

  if (context.getType() === "ws")
    request = context.switchToWs().getClient().handshake;

  const user = request.user as User;

  return data ? user[data] : user;
});
