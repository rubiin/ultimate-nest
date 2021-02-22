import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(error: any, user: any, info: Error) {
		if (error || info || !user) {
			const error =
				info?.name === 'TokenExpiredError'
					? new UnauthorizedException(
							'The session has expired. Please relogin',
					  )
					: new UnauthorizedException('Token malformed');

			throw error;
		}

		return user;
	}
}
