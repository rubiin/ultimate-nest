import {
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private readonly reflector: Reflector, private readonly i18nService: I18nService) {
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
			if (info instanceof TokenExpiredError) {
				throw new ForbiddenException(
					this.i18nService.t("exception.token", {
						args: { error: "expired" },
					}),
				);
			} else if (info instanceof JsonWebTokenError) {
				throw new UnauthorizedException(
					this.i18nService.t("exception.token", {
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
