import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/* istanbul ignore file */

export const GetIdx = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		return ctx.switchToHttp().getRequest().idx;
	},
);
