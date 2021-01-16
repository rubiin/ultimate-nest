import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/* istanbul ignore file */

export const GetUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		return ctx.switchToHttp().getRequest().user;
	},
);
