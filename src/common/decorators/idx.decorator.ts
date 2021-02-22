import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/* istanbul ignore file */

export const GetUserIdx = createParamDecorator(
	(data: unknown, context: ExecutionContext) => {
		return context.switchToHttp().getRequest().idx;
	},
);
