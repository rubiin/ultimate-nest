import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/core";
import { TokensService } from "@modules/token/tokens.service";
import { HelperService } from "@common/helpers/helpers.utils";
import { User } from "@entities";
import { IResponse } from "@common/interfaces/response.interface";
import * as argon from "argon2";
import { omit } from "@rubiin/js-utils";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		private readonly tokenService: TokensService,
		private readonly configService: ConfigService,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.userRepository.findOne({ email });

		if (user.isObsolete) {
			throw new BadRequestException("Invalid credentials");
		}

		if (!user.isActive) {
			throw new ForbiddenException(
				"Account not found. Please create new account from the Login screen.",
			);
		}

		if (user && (await argon.verify(user.password, pass))) {
			return omit(user, ["password"]);
		}

		return null;
	}

	/**
	 *
	 *
	 * @param {UserLoginDto} userDto
	 * @return {Promise<IResponse<any>>}
	 * @memberof AuthService
	 */
	async login(user: User): Promise<any> {
		const token = await this.tokenService.generateAccessToken(user);
		const refresh = await this.tokenService.generateRefreshToken(
			user,
			this.configService.get<number>("jwt.refreshExpiry"),
		);

		const payload = HelperService.buildPayloadResponse(
			user,
			token,
			refresh,
		);

		return payload;
	}

	/**
	 *
	 * Logout the user from all the devices by invalidating all his refresh tokens
	 *
	 * @param {User} user
	 * @return {Promise<IResponse>}
	 * @memberof AuthService
	 */
	async logoutFromAll(user: User): Promise<IResponse<any>> {
		return this.tokenService.deleteRefreshTokenForUser(user);
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @param {string} refreshToken
	 * @return {*}  {Promise<IResponse<any>>}
	 * @memberof AuthService
	 */
	async logout(user: User, refreshToken: string): Promise<IResponse<any>> {
		const payload = await this.tokenService.decodeRefreshToken(
			refreshToken,
		);

		return this.tokenService.deleteRefreshToken(user, payload);
	}
}
