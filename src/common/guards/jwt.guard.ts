import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	handleRequest(error: any, user: any, info: Error) {
		if (error || info || !user) {
			if (info?.name === "TokenExpiredError") {
				new UnauthorizedException(
					"The session has expired. Please relogin",
				);
			} else if (info?.name === "JsonWebTokenError") {
				throw new UnauthorizedException("Token malformed");
			} else {
				throw new UnauthorizedException(info?.message);
			}
		}
	}
}
