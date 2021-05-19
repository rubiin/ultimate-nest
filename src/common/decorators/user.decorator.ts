import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LoggedInUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => {
		return context.switchToHttp().getRequest().user;
	},
);
