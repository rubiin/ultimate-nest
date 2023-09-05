import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import type { User } from "@entities";

/*
The `LoggedInUser` decorator is used to get the user object from the request object.
*/
export const LoggedInUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
  let request = context.switchToHttp().getRequest();

  if (context.getType() === "ws")
    request = context.switchToWs().getClient().handshake;

  const user: User = request.user;

  return data ? user[data] : user;
});
