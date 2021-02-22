import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/* istanbul ignore file */

export const LoggedInUser = createParamDecorator(
	(data: unknown, context: ExecutionContext) => {
		return context.switchToHttp().getRequest().user;
	},
);
