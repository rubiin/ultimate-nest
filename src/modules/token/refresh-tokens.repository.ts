import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { from, map } from "rxjs";
import type { User } from "@entities";
import { RefreshToken } from "@entities";

@Injectable()
export class RefreshTokensRepository {
  constructor(
    private readonly em: EntityManager,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: EntityRepository<RefreshToken>,
  ) {}

  /**
   * It creates a new refresh token for the given user and expiration time
   * @param user - The user that the token is being created for.
   * @param ttl - number - the time to live of the token in seconds
   * @returns A refresh token
   */
  createRefreshToken(user: User, ttl: number): Observable<RefreshToken> {
    const expiration = new Date();

    // the input is treated as millis so *1000 is necessary
    const ttlSeconds = ttl * 1000; // seconds

    expiration.setTime(expiration.getTime() + ttlSeconds);

    const token = this.refreshTokenRepository.create({
      user: user.id,
      expiresIn: expiration,
    });

    return from(this.em.persistAndFlush(token)).pipe(map(() => token));
  }

  /**
   * It finds a refresh token by its id and returns it as an observable
   * @param id - The id of the token to be found.
   * @returns Observable<RefreshToken>
   */
  findTokenById(id: number): Observable<RefreshToken> {
    return from(
      this.refreshTokenRepository.findOneOrFail({
        id,
        isRevoked: false,
      }),
    );
  }

  /**
   * It deletes all refresh tokens for a given user
   * @param user - User - The user object that we want to delete the tokens for.
   * @returns A boolean value.
   */
  deleteTokensForUser(user: User): Observable<boolean> {
    return from(this.refreshTokenRepository.nativeUpdate({ user }, { isRevoked: true })).pipe(
      map(() => true),
    );
  }

  /**
   * It deletes a refresh token by setting its `isRevoked` property to `true`
   * @param user - User - the user object that is currently logged in
   * @param tokenId - The ID of the token to be deleted.
   * @returns A boolean value.
   */
  deleteToken(user: User, tokenId: number): Observable<boolean> {
    return from(
      this.refreshTokenRepository.nativeUpdate({ user, id: tokenId }, { isRevoked: true }),
    ).pipe(map(() => true));
  }
}
