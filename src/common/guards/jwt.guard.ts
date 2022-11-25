import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest(error: any, user: any, info: any) {
		if (error || info || !user) {
			if (info?.name === "TokenExpiredError") {
				throw new UnauthorizedException("The session has expired. Please relogin");
			} else if (info?.name === "JsonWebTokenError") {
				throw new UnauthorizedException("Token malformed");
			} else {
				throw new UnauthorizedException(info?.message);
			}
		}

		return user;
	}
}
