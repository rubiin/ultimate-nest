import { IResponse } from '@common/interfaces/response.interface';
import { RefreshToken, User } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { pick } from '@rubiin/js-utils';
import { TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokensRepository } from './refresh-tokens.repository';

export interface RefreshTokenPayload {
	jti: number;
	sub: number;
}

/**
 *
 *
 * @export
 * @class TokensService
 */
@Injectable()
export class TokensService {
	private readonly tokens: RefreshTokensRepository;
	private readonly jwt: JwtService;
	private readonly BASE_OPTIONS: JwtSignOptions = {
		issuer: 'some-app',
		audience: 'some-app',
	};

	/**
	 * Creates an instance of TokensService.
	 * @param {RefreshTokensRepository} tokens
	 * @param {JwtService} jwt
	 * @param {EntityRepository<User>} userRepository
	 * @memberof TokensService
	 */
	constructor(
		tokens: RefreshTokensRepository,
		jwt: JwtService,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {
		this.tokens = tokens;
		this.jwt = jwt;
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @return {*}  {Promise<string>}
	 * @memberof TokensService
	 */
	async generateAccessToken(user: User): Promise<string> {
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			subject: String(user.id),
		};

		return this.jwt.signAsync({ ...pick(user, ['id', 'idx']) }, options);
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @param {number} expiresIn
	 * @return {*}  {Promise<string>}
	 * @memberof TokensService
	 */
	async generateRefreshToken(user: User, expiresIn: number): Promise<string> {
		const token = await this.tokens.createRefreshToken(user, expiresIn);

		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			expiresIn,
			subject: String(user.id),
			jwtid: String(token.id),
		};

		return this.jwt.signAsync({}, options);
	}

	/**
	 *
	 *
	 * @param {string} encoded
	 * @return {*}  {Promise<{ user: User; token: RefreshToken }>}
	 * @memberof TokensService
	 */
	async resolveRefreshToken(
		encoded: string,
	): Promise<{ user: User; token: RefreshToken }> {
		const payload = await this.decodeRefreshToken(encoded);
		const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

		if (!token) {
			throw new UnauthorizedException('Refresh token not found');
		}

		if (token.isRevoked) {
			throw new UnauthorizedException('Refresh token revoked');
		}

		const user = await this.getUserFromRefreshTokenPayload(payload);

		if (!user) {
			throw new UnauthorizedException('Refresh token malformed');
		}

		return { user, token };
	}

	/**
	 *
	 *
	 * @param {string} refresh
	 * @return {*}  {Promise<{ token: string; user: User }>}
	 * @memberof TokensService
	 */
	async createAccessTokenFromRefreshToken(
		refresh: string,
	): Promise<{ token: string; user: User }> {
		const { user } = await this.resolveRefreshToken(refresh);

		const token = await this.generateAccessToken(user);

		return { user, token };
	}

	/**
	 *
	 *
	 * @param {string} token
	 * @return {*}  {Promise<RefreshTokenPayload>}
	 * @memberof TokensService
	 */
	async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
		try {
			return this.jwt.verify(token);
		} catch (error_) {
			const error =
				error_ instanceof TokenExpiredError
					? new UnauthorizedException('Refresh token expired')
					: new UnauthorizedException('Refresh token malformed');

			throw error;
		}
	}

	/**
	 *
	 * Remove all the refresh tokens associated to a user
	 *
	 * @param {Customer} user
	 * @memberof TokensService
	 */
	async deleteRefreshTokenForUser(user: User): Promise<IResponse> {
		await this.tokens.deleteTokensForUser(user);

		return { message: 'Operation Sucessful' };
	}

	/**
	 *
	 * Removes a refresh token, and invalidated all access tokens for the user
	 *
	 * @param {Customer} user
	 * @param {RefreshTokenPayload} payload
	 * @memberof TokensService
	 */

	async deleteRefreshToken(
		user: User,
		payload: RefreshTokenPayload,
	): Promise<IResponse> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException('Refresh token malformed');
		}
		await this.tokens.deleteToken(user, tokenId);

		return { message: 'Operation Sucessful' };
	}

	/**
	 *
	 *
	 * @private
	 * @param {RefreshTokenPayload} payload
	 * @return {*}  {Promise<User>}
	 * @memberof TokensService
	 */
	private async getUserFromRefreshTokenPayload(
		payload: RefreshTokenPayload,
	): Promise<User> {
		const subId = payload.sub;

		if (!subId) {
			throw new UnauthorizedException('Refresh token malformed');
		}

		return this.userRepository.findOne({
			id: subId,
		});
	}

	/**
	 *
	 *
	 * @private
	 * @param {RefreshTokenPayload} payload
	 * @return {*}  {(Promise<RefreshToken | null>)}
	 * @memberof TokensService
	 */
	private async getStoredTokenFromRefreshTokenPayload(
		payload: RefreshTokenPayload,
	): Promise<RefreshToken | null> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException('Refresh token malformed');
		}

		return this.tokens.findTokenById(tokenId);
	}
}
