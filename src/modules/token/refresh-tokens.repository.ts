import { RefreshToken, User } from "@entities";
import { MikroORM } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { from, map, Observable } from "rxjs";

@Injectable()
export class RefreshTokensRepository {
	constructor(
		@InjectRepository(RefreshToken)
		private readonly refreshTokenRepository: EntityRepository<RefreshToken>,
		private readonly orm: MikroORM,
	) {}

	createRefreshToken(user: User, ttl: number): Observable<RefreshToken> {
		const expiration = new Date();

		// the input is treated as millis so *1000 is necessary

		expiration.setTime(expiration.getTime() + ttl * 1000);

		const token = this.refreshTokenRepository.create({
			user,
			expiresIn: expiration,
		});

		return from(this.refreshTokenRepository.persistAndFlush(token)).pipe(
			map(() => token),
		);
	}

	findTokenByIdx(id: number): Observable<RefreshToken> {
		return from(
			this.refreshTokenRepository.findOne({
				id,
				isRevoked: false,
			}),
		);
	}

	deleteTokensForUser(user: User): Observable<boolean> {
		return from(
			this.refreshTokenRepository.nativeUpdate(
				{ user },
				{ isRevoked: true },
			),
		).pipe(map(() => true));
	}

	deleteToken(user: User, tokenId: number): Observable<boolean> {
		return from(
			this.refreshTokenRepository.nativeUpdate(
				{ user, id: tokenId },
				{ isRevoked: true },
			),
		).pipe(map(() => true));
	}
}
