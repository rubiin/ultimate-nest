import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import type { User } from "@entities";

/* A decorator that will be used to get the user from the request. */
export const LoggedInUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
  let request = context.switchToHttp().getRequest();

  if (context.getType() === "ws")
    request = context.switchToWs().getClient().handshake;

  const user: User = request.user;

  return data ? user[data] : user;
});
