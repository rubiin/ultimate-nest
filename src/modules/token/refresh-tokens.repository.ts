import { User } from "@entities";
import { RefreshToken } from "@entities";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { from, map } from "rxjs";

@Injectable()
export class RefreshTokensRepository {
  constructor(
    private readonly em: EntityManager<PostgreSqlDriver>,
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
      expiresIn: expiration,
      user: user.id,
    });

    return from(this.em.persist(token).flush()).pipe(map(() => token));
  }

  /**
   * It finds a non-revoked refresh token by its id and returns it as an observable
   * @param id - The id of the token to be found.
   * @returns Observable<RefreshToken | null> - null when the token is revoked or missing
   */
  findTokenById(id: number): Observable<RefreshToken | null> {
    return from(
      this.refreshTokenRepository.findOne({
        id,
        isRevoked: false,
      }),
    );
  }

  /**
   * Revokes a still-active refresh token. The `isRevoked: false` filter makes this a
   * compare-and-set, so of two concurrent rotations of the same token only one wins.
   * @param id - The id of the token to revoke.
   * @returns true when this call revoked the token, false when it was already revoked or missing
   */
  revokeToken(id: number): Observable<boolean> {
    return from(
      this.refreshTokenRepository.nativeUpdate({ id, isRevoked: false }, { isRevoked: true }),
    ).pipe(map((affected) => affected === 1));
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
      this.refreshTokenRepository.nativeUpdate({ id: tokenId, user }, { isRevoked: true }),
    ).pipe(map(() => true));
  }
}
