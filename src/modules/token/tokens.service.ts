import { TokenExpiredError } from "jsonwebtoken";
import { EntityRepository } from "@mikro-orm/postgresql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { JwtSignOptions } from "@nestjs/jwt";
import { pick } from "helper-fns";
import type { Observable } from "rxjs";
import { catchError, from, map, mergeMap, of, switchMap, throwError } from "rxjs";

import { translate } from "@lib/i18n";
import type { RefreshToken } from "@entities";
import { User } from "@entities";
import type { JwtPayload } from "@common/@types";
import { RefreshTokensRepository } from "./refresh-tokens.repository";

@Injectable()
export class TokensService {
  private readonly BASE_OPTIONS: JwtSignOptions = {
    issuer: "nestify",
    audience: "nestify",
  };

  constructor(
        @InjectRepository(User)
        private readonly userRepository: EntityRepository<User>,
        private readonly refreshTokenRepo: RefreshTokensRepository,
        private readonly jwt: JwtService,
  ) {}

  /**
   * It takes a user object, and returns an observable of a string
   * @param user - Omit<User, "password">
   * @returns An Observable of a string.
   */
  generateAccessToken(user: Omit<User, "password">): Observable<string> {
    const options: JwtSignOptions = {
      ...this.BASE_OPTIONS,
      subject: String(user.id),
    };

    return from(
      this.jwt.signAsync({ ...pick(user, ["roles", "isTwoFactorEnabled"]) }, options),
    );
  }

  /**
   * It creates a refresh token in the database, then signs it with JWT
   * @param user - User - The user object that we want to generate a token for.
   * @param expiresIn - number - The number of seconds the token will be valid for.
   * @returns A string
   */
  generateRefreshToken(user: User, expiresIn: number): Observable<string> {
    return this.refreshTokenRepo.createRefreshToken(user, expiresIn).pipe(
      switchMap((token) => {
        const options: JwtSignOptions = {
          ...this.BASE_OPTIONS,
          expiresIn,
          subject: String(user.id),
          jwtid: String(token.id),
        };

        return from(this.jwt.signAsync({}, options));
      }),
    );
  }

  /**
   * It takes an encoded refresh token, decodes it, finds the user and token in the database, and
   * returns them
   * @param encoded - string - The encoded refresh token
   * @returns An object with a user and a token.
   */
  resolveRefreshToken(encoded: string): Observable<{ user: User, token: RefreshToken }> {
    return this.decodeRefreshToken(encoded).pipe(
      switchMap((payload) => {
        return this.getStoredTokenFromRefreshTokenPayload(payload).pipe(
          switchMap((token) => {
            if (!token) {
              return throwError(
                () =>
                  new UnauthorizedException(
                    translate("exception.refreshToken", {
                      args: { error: "not found" },
                    }),
                  ),
              );
            }

            if (token.isRevoked) {
              return throwError(
                () =>
                  new UnauthorizedException(
                    translate("exception.refreshToken", {
                      args: { error: "revoked" },
                    }),
                  ),
              );
            }

            return this.getUserFromRefreshTokenPayload(payload).pipe(
              mergeMap((user) => {
                if (!user) {
                  return throwError(
                    () =>
                      new UnauthorizedException(
                        translate("exception.refreshToken", {
                          args: { error: "malformed" },
                        }),
                      ),
                  );
                }

                return of({ user, token });
              }),
            );
          }),
        );
      }),
    );
  }

  /**
   * It takes a refresh token, resolves it to a user, and then generates an access token for that user
   * @param refresh - string - The refresh token that was sent to the client.
   * @returns An object with a token and a user.
   */
  createAccessTokenFromRefreshToken(refresh: string): Observable<{ token: string, user: User }> {
    return this.resolveRefreshToken(refresh).pipe(
      switchMap(({ user }) => {
        return this.generateAccessToken(user).pipe(
          map((token) => {
            return { token, user };
          }),
        );
      }),
    );
  }

  /**
   * It decodes the refresh token and throws an error if the token is expired or malformed
   * @param token - The refresh token to decode.
   * @returns The payload of the token.
   */
  decodeRefreshToken(token: string): Observable<JwtPayload> {
    return from(this.jwt.verifyAsync(token)).pipe(
      map((payload: JwtPayload) => payload),
      catchError((error_) => {
        throw error_ instanceof TokenExpiredError
          ? new UnauthorizedException(
            translate("exception.refreshToken", {
              args: { error: "expired" },
            }),
          )
          : new UnauthorizedException(
            translate("exception.refreshToken", {
              args: { error: "malformed" },
            }),
          );
      }),
    );
  }

  /**
   * It deletes all the refresh token for the given user, and then returns the user
   * @param user - The user object that we want to delete the refresh token for.
   * @returns The user object.
   */
  deleteRefreshTokenForUser(user: User): Observable<User> {
    return this.refreshTokenRepo.deleteTokensForUser(user).pipe(
      map(() => {
        return user;
      }),
    );
  }

  /**
   * It deletes the refresh token from the database and returns the user
   * @param user - The user object that was returned from the validateUser method.
   * @param payload - The payload of the refresh token.
   * @returns The user object
   */
  deleteRefreshToken(user: User, payload: JwtPayload): Observable<User> {
    const tokenId = payload.jti;

    if (!tokenId) {
      return throwError(
        () =>
          new UnauthorizedException(
            translate("exception.refreshToken", {
              args: { error: "malformed" },
            }),
          ),
      );
    }

    return this.refreshTokenRepo.deleteToken(user, tokenId).pipe(
      map(() => {
        return user;
      }),
    );
  }

  /**
   * It takes a refresh token payload, extracts the user ID from it, and then returns an observable of
   * the user with that ID
   * @param payload - IJwtPayload
   * @returns A user object
   */
  getUserFromRefreshTokenPayload(payload: JwtPayload): Observable<User> {
    const subId = payload.sub;

    if (!subId) {
      return throwError(
        () =>
          new UnauthorizedException(
            translate("exception.refreshToken", {
              args: { error: "malformed" },
            }),
          ),
      );
    }

    return from(
      this.userRepository.findOneOrFail({
        id: subId,
      }),
    );
  }

  /**
   * It takes a refresh token payload, extracts the token ID from it, and then uses that token ID to
   * find the corresponding refresh token in the database
   * @param payload - IJwtPayload
   * @returns Observable<RefreshToken | null>
   */
  getStoredTokenFromRefreshTokenPayload(payload: JwtPayload): Observable<RefreshToken | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      return throwError(
        () =>
          new UnauthorizedException(
            translate("exception.refreshToken", {
              args: { error: "malformed" },
            }),
          ),
      );
    }

    return this.refreshTokenRepo.findTokenById(tokenId);
  }
}
