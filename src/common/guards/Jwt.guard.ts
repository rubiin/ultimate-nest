import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err: any, user: any, info: Error) {
		if (err || info || !user) {
			if (info?.name === 'TokenExpiredError') {
				throw new UnauthorizedException(
					'The session has expired. Please relogin',
				);
			} else {
				throw new UnauthorizedException('Token malformed');
			}
		}

		return user;
	}
}
