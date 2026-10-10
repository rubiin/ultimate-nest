import type { ClientInfo } from "@common/@types";
import { MS_PER_SECOND } from "@common/constant";
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
   * @param client - IP address and user agent of the caller, shown in the session list
   * @returns A refresh token
   */
  createRefreshToken(user: User, ttl: number, client?: ClientInfo): Observable<RefreshToken> {
    const expiration = new Date();

    const ttlMs = ttl * MS_PER_SECOND;

    expiration.setTime(expiration.getTime() + ttlMs);

    const token = this.refreshTokenRepository.create({
      expiresIn: expiration,
      ipAddress: client?.ipAddress,
      // Column is varchar(512); a longer header would fail the insert and block the login.
      userAgent: client?.userAgent?.slice(0, 512),
      user: user.id,
    });

    return from(this.em.persist(token).flush()).pipe(map(() => token));
  }

  /**
   * Lists the user's sessions: refresh tokens that are neither revoked nor expired, newest first.
   * @param user - The owner of the tokens.
   */
  findActiveTokensForUser(user: User): Observable<RefreshToken[]> {
    return from(
      this.refreshTokenRepository.find(
        { expiresIn: { $gt: new Date() }, isRevoked: false, user },
        { orderBy: { createdAt: "desc" } },
      ),
    );
  }

  /**
   * Revokes one of the user's own active tokens.
   * @returns true when a token was revoked, false when it is missing, not theirs or already revoked
   */
  revokeUserToken(user: User, idx: string): Observable<boolean> {
    return from(
      this.refreshTokenRepository.nativeUpdate(
        { idx, isRevoked: false, user },
        { isRevoked: true },
      ),
    ).pipe(map((affected) => affected === 1));
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
