import {
	loginSignupReponse,
	IResponse,
} from '@common/interface/response.interface';
import { ActivityLog } from '@entities/ActivityLog.entity';
import { User } from '@entities/User.entity';
import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { startOfDay, endOfDay } from 'date-fns';
import { config } from 'process';
import * as argon from 'argon2';
import { UserLoginDto } from '@dtos/UserLogin.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { TokensService } from '@modules/token/tokens.service';
import { buildResponsePayload } from '@common/utils/helpers.utils';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		private readonly tokenService: TokensService,
	) {}

	async loginUser(userDto: UserLoginDto): Promise<loginSignupReponse> {
		let user = await this.userRepository.findOne({
			username: userDto.email,
		});

		if (user.isObsolete) {
			throw new BadRequestException('Invalid credentials');
		}

		if (!user.isActive) {
			throw new HttpException(
				'Account not found for this email. Please create new account from the Login screen.',
				HttpStatus.FORBIDDEN,
			);
		}

		const token = await this.tokenService.generateAccessToken(user);
		const refresh = await this.tokenService.generateRefreshToken(user, 123);

		const payload = buildResponsePayload(user, token, refresh);

		return {
			message: 'Successfully signed in',
			data: payload,
		};
	}

	/**
	 * Logout the user from all the devices by invalidating all his refresh tokens
	 * @param employee The employee to logout
	 */

	async logoutFromAll(user: User): Promise<IResponse> {
		return this.tokenService.deleteRefreshTokenForUser(user);
	}
}
