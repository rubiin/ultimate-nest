import { translate } from "@lib/i18n";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenExpiredError } from "jsonwebtoken";

/**
 *
 * The purpose of this guard is to provide a layer for extracting idx from jwt
 *
 */

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwt: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();

		const token = request.headers.authorization;

		if (!token) {
			throw new UnauthorizedException(
				translate("exception.apiUnauthorizedResponse"),
			);
		}

		try {
			const decoded: { idx: string } = this.jwt.verify(token.split(" ")[1]);

			request.idx = decoded.idx;

			return true;
		} catch (error_) {
			throw error_ instanceof TokenExpiredError
				? new UnauthorizedException(
						translate("exception.token", {
							args: { error: "expired" },
						}),
				  )
				: new UnauthorizedException(
						translate("exception.token", {
							args: { error: "malformed" },
						}),
				  );
		}
	}
}
