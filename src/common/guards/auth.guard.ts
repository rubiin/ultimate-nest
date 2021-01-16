import {
	CanActivate,
	ExecutionContext,
	HttpException,
	UnprocessableEntityException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import config from '@config/index';

/**
 *
 * The purpose of this guard is to provide a layer for extracting idx from jwt
 *
 */

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();

		const token = request.headers.authorization;

		if (!token) {
			throw new HttpException(
				'Token not found in request',
				HttpStatus.UNAUTHORIZED,
			);
		}

		try {
			const decoded: any = jwt.verify(token.split(' ')[1], config.secret);

			request.idx = decoded.idx;

			return true;
		} catch (e) {
			if (e?.name === 'TokenExpiredError') {
				throw new UnprocessableEntityException(
					'The session has expired. Please relogin',
				);
			} else {
				throw new UnprocessableEntityException('Token malformed');
			}
		}
	}
}
