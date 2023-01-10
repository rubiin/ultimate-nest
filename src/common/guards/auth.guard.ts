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
			throw new UnauthorizedException("Token not found in request");
		}

		try {
			const decoded: { idx: string } = this.jwt.verify(token.split(" ")[1]);

			request.idx = decoded.idx;

			return true;
		} catch (error_) {
			const error =
				error_ instanceof TokenExpiredError
					? new UnauthorizedException("The session has expired. Please re-login")
					: new UnauthorizedException("Token malformed");

			throw error;
		}
	}
}
