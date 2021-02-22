import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { IResponse } from '@common/interface/response.interface';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { pick } from '@rubiin/js-utils';
import { RefreshToken, User } from '@entities';

const BASE_OPTIONS: SignOptions = {
	issuer: 'some-app',
	audience: 'some-app',
};

export interface RefreshTokenPayload {
	jti: number;
	sub: number;
}

@Injectable()
export class TokensService {
	private readonly tokens: RefreshTokensRepository;
	private readonly jwt: JwtService;

	public constructor(
		tokens: RefreshTokensRepository,
		jwt: JwtService,
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {
		this.tokens = tokens;
		this.jwt = jwt;
	}

	public async generateAccessToken(user: User): Promise<string> {
		const options: SignOptions = {
			...BASE_OPTIONS,
			subject: String(user.id),
		};

		return this.jwt.signAsync({ ...pick(user, ['id', 'idx']) }, options);
	}

	public async generateRefreshToken(
		user: User,
		expiresIn: number,
	): Promise<string> {
		const token = await this.tokens.createRefreshToken(user, expiresIn);

		const options: SignOptions = {
			...BASE_OPTIONS,
			expiresIn,
			subject: String(user.id),
			jwtid: String(token.id),
		};

		return this.jwt.signAsync({}, options);
	}

	public async resolveRefreshToken(
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

	public async createAccessTokenFromRefreshToken(
		refresh: string,
	): Promise<{ token: string; user: User }> {
		const { user } = await this.resolveRefreshToken(refresh);

		const token = await this.generateAccessToken(user);

		return { user, token };
	}

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
