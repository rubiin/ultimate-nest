import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/* istanbul ignore file */

export const LoggedInUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		return ctx.switchToHttp().getRequest().user;
	},
);
