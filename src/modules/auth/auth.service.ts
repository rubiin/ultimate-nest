import {
	ILoginSignupReponse,
	IResponse,
} from '@common/interface/response.interface';
import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { UserLoginDto } from '@modules/auth/dtos/user-login';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { TokensService } from '@modules/token/tokens.service';
import { HelperService } from '@common/helpers/helpers.utils';
import { User } from '@entities';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		private readonly tokenService: TokensService,
	) {}

	/**
	 *
	 *
	 * @param {UserLoginDto} userDto
	 * @returns {Promise<ILoginSignupReponse>}
	 * @memberof AuthService
	 */
	async loginUser(userDto: UserLoginDto): Promise<ILoginSignupReponse> {
		const user = await this.userRepository.findOne({
			userName: userDto.email,
			isActive: true,
			isObsolete: false,
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

		const payload = HelperService.buildPayloadResponse(
			user,
			token,
			refresh,
		);

		return {
			message: 'Successfully signed in',
			data: payload,
		};
	}

	/**
	 *
	 * Logout the user from all the devices by invalidating all his refresh tokens\
	 *
	 * @param {User} user
	 * @returns {Promise<IResponse>}
	 * @memberof AuthService
	 */
	async logoutFromAll(user: User): Promise<IResponse> {
		return this.tokenService.deleteRefreshTokenForUser(user);
	}
}
