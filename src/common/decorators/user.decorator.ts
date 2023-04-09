import { User } from "@entities";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/* A decorator that will be used to get the user from the request. */
export const LoggedInUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
	let request = context.switchToHttp().getRequest();

	if (context.getType() === "ws") {
		request = context.switchToWs().getClient().handshake;
	}

	const user = request.user;

	return data ? user && user[data] : user;
});
