import {User} from "@entities";
import {createParamDecorator, ExecutionContext} from "@nestjs/common";

export const LoggedInUser = createParamDecorator(
    (data: keyof User, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return data ? user && user[data] : user;
    },
);
