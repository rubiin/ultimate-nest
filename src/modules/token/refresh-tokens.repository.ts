import { RefreshToken, User } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokensRepository {
	constructor(
		@InjectRepository(RefreshToken)
		private readonly refreshTokenRepository: EntityRepository<RefreshToken>,
	) {}

	public async createRefreshToken(
		user: User,
		ttl: number,
	): Promise<RefreshToken> {
		const token = new RefreshToken();

		token.user = user;
		token.isRevoked = false;

		const expiration = new Date();

		// the input is treated as milis so *1000 is necessary

		expiration.setTime(expiration.getTime() + ttl * 1000);

		token.expiresIn = expiration;

		await this.refreshTokenRepository.persistAndFlush(token);

		return token;
	}

	public async findTokenById(id: number): Promise<RefreshToken | null> {
		return this.refreshTokenRepository.findOne({
			id,
			isRevoked: false,
		});
	}

	public async deleteTokensForUser(user: User): Promise<any> {
		return this.refreshTokenRepository.nativeUpdate(
			{ user },
			{ isRevoked: true },
		);
	}

	public async deleteToken(user: User, tokenId: number): Promise<any> {
		return this.refreshTokenRepository.nativeUpdate(
			{ user, id: tokenId },
			{ is_revoked: true },
		);
	}
}
