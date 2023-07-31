import { IS_PUBLIC_KEY_META } from "@common/constant";
import { translate } from "@lib/i18n";
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY_META, context.getHandler());

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest(error: any, user: any, info: any) {
		if (error || info || !user) {
			if (info instanceof TokenExpiredError) {
				throw new ForbiddenException(
					translate("exception.token", {
						args: { error: "expired" },
					}),
				);
			} else if (info instanceof JsonWebTokenError) {
				throw new UnauthorizedException(
					translate("exception.token", {
						args: { error: "malformed" },
					}),
				);
			} else {
				throw new UnauthorizedException(info?.message);
			}
		}

		return user;
	}
}
