import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { IResponse } from '@common/interface/response.interface';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '@entities/User.entity';
import { EntityRepository } from '@mikro-orm/core';
import { pick } from '@rubiin/js-utils';
import { RefreshToken } from '@entities/RefreshToken.entity';

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
		const opts: SignOptions = {
			...BASE_OPTIONS,
			subject: String(user.id),
		};

		return this.jwt.signAsync({ ...pick(user, ['id', 'idx']) }, opts);
	}

	public async generateRefreshToken(
		user: User,
		expiresIn: number,
	): Promise<string> {
		const token = await this.tokens.createRefreshToken(user, expiresIn);

		const opts: SignOptions = {
			...BASE_OPTIONS,
			expiresIn,
			subject: String(user.id),
			jwtid: String(token.id),
		};

		return this.jwt.signAsync({}, opts);
	}

	public async resolveRefreshToken(
		encoded: string,
	): Promise<{ user: User; token: RefreshToken }> {
		const payload = await this.decodeRefreshToken(encoded);
		const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

		if (!token) {
			throw new UnprocessableEntityException('Refresh token not found');
		}

		if (token.isRevoked) {
			throw new UnprocessableEntityException('Refresh token revoked');
		}

		const user = await this.getUserFromRefreshTokenPayload(payload);

		if (!user) {
			throw new UnprocessableEntityException('Refresh token malformed');
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
		} catch (e) {
			if (e instanceof TokenExpiredError) {
				throw new UnprocessableEntityException('Refresh token expired');
			} else {
				throw new UnprocessableEntityException(
					'Refresh token malformed',
				);
			}
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
			throw new UnprocessableEntityException('Refresh token malformed');
		}
		await this.tokens.deleteToken(user, tokenId);

		return { message: 'Operation Sucessful' };
	}

	private async getUserFromRefreshTokenPayload(
		payload: RefreshTokenPayload,
	): Promise<User> {
		const subId = payload.sub;

		if (!subId) {
			throw new UnprocessableEntityException('Refresh token malformed');
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
			throw new UnprocessableEntityException('Refresh token malformed');
		}

		return this.tokens.findTokenById(tokenId);
	}
}
