import { RefreshToken, User } from "@entities";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { pick } from "helper-fns";
import { TokenExpiredError } from "jsonwebtoken";
import { from, lastValueFrom, map, Observable, switchMap } from "rxjs";
import { RefreshTokensRepository } from "./refresh-tokens.repository";

export interface RefreshTokenPayload {
	jti: number;
	sub: number;
}

@Injectable()
export class TokensService {
	private readonly tokens: RefreshTokensRepository;
	private readonly jwt: JwtService;
	private readonly BASE_OPTIONS: JwtSignOptions = {
		issuer: "nestify",
		audience: "nestify",
	};

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
	 * It takes a user object, and returns an observable of a string
	 * @param user - Omit<User, "password">
	 * @returns An Observable of a string.
	 */
	generateAccessToken(user: Omit<User, "password">): Observable<string> {
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			subject: String(user.id),
		};

		return from(this.jwt.signAsync({ ...pick(user, ["id", "idx", "email"]) }, options));
	}

	/**
	 * It creates a refresh token in the database, then signs it with JWT
	 * @param {User} user - User - The user object that we want to generate a token for.
	 * @param {number} expiresIn - number - The number of seconds the token will be valid for.
	 * @returns A string
	 */
	generateRefreshToken(user: User, expiresIn: number): Observable<string> {
		return this.tokens.createRefreshToken(user, expiresIn).pipe(
			switchMap(token => {
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
	 * @param {string} encoded - string - The encoded refresh token
	 * @returns An object with a user and a token.
	 */
	async resolveRefreshToken(encoded: string): Promise<{ user: User; token: RefreshToken }> {
		const payload = await this.decodeRefreshToken(encoded);
		const token = await lastValueFrom(this.getStoredTokenFromRefreshTokenPayload(payload));

		if (!token) {
			throw new UnauthorizedException("Refresh token not found");
		}

		if (token.isRevoked) {
			throw new UnauthorizedException("Refresh token revoked");
		}

		const user = await lastValueFrom(this.getUserFromRefreshTokenPayload(payload));

		if (!user) {
			throw new UnauthorizedException("Refresh token malformed");
		}

		return { user, token };
	}

	/**
	 * It takes a refresh token, resolves it to a user, and then generates an access token for that user
	 * @param {string} refresh - string - The refresh token that was sent to the client.
	 * @returns { token: string; user: User }
	 */
	async createAccessTokenFromRefreshToken(
		refresh: string,
	): Promise<{ token: string; user: User }> {
		const { user } = await this.resolveRefreshToken(refresh);

		const token = await lastValueFrom(this.generateAccessToken(user));

		return { user, token };
	}

	/**
	 * It decodes the refresh token and throws an error if the token is expired or malformed
	 * @param {string} token - The refresh token to decode.
	 * @returns The payload of the token.
	 */
	async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
		try {
			return this.jwt.verify(token);
		} catch (error_) {
			const error =
				error_ instanceof TokenExpiredError
					? new UnauthorizedException("Refresh token expired")
					: new UnauthorizedException("Refresh token malformed");

			throw error;
		}
	}

	/**
	 * It deletes the refresh token for the given user, and then returns the user
	 * @param {User} user - The user object that we want to delete the refresh token for.
	 * @returns The user object.
	 */
	deleteRefreshTokenForUser(user: User): Observable<User> {
		return this.tokens.deleteTokensForUser(user).pipe(
			map(() => {
				return user;
			}),
		);
	}

	/**
	 * It deletes the refresh token from the database and returns the user
	 * @param {User} user - The user object that was returned from the validateUser method.
	 * @param {RefreshTokenPayload} payload - The payload of the refresh token.
	 * @returns The user object
	 */
	deleteRefreshToken(user: User, payload: RefreshTokenPayload): Observable<User> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException("Refresh token malformed");
		}

		return this.tokens.deleteToken(user, tokenId).pipe(
			map(() => {
				return user;
			}),
		);
	}

	/**
	 * It takes a refresh token payload, extracts the user ID from it, and then returns an observable of
	 * the user with that ID
	 * @param {RefreshTokenPayload} payload - RefreshTokenPayload
	 * @returns A user object
	 */
	private getUserFromRefreshTokenPayload(payload: RefreshTokenPayload): Observable<User> {
		const subId = payload.sub;

		if (!subId) {
			throw new UnauthorizedException("Refresh token malformed");
		}

		return from(
			this.userRepository.findOne({
				id: subId,
			}),
		);
	}

	/**
	 * It takes a refresh token payload, extracts the token ID from it, and then uses that token ID to
	 * find the corresponding refresh token in the database
	 * @param {RefreshTokenPayload} payload - RefreshTokenPayload
	 * @returns Observable<RefreshToken | null>
	 */
	private getStoredTokenFromRefreshTokenPayload(
		payload: RefreshTokenPayload,
	): Observable<RefreshToken | null> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException("Refresh token malformed");
		}

		return from(this.tokens.findTokenByIdx(tokenId));
	}
}
