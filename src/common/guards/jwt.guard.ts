import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
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
