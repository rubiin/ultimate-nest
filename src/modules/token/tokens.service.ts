import { IResponse } from "@common/interfaces/response.interface";
import { RefreshToken, User } from "@entities";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { pick } from "@rubiin/js-utils";
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
		issuer: "some-app",
		audience: "some-app",
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
	 *
	 *
	 * @param {User} user
	 * @return {*}  {Observable<string>}
	 * @memberof TokensService
	 */
	generateAccessToken(user: User): Observable<string> {
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			subject: String(user.id),
		};

		return from(
			this.jwt.signAsync({ ...pick(user, ["id", "idx"]) }, options),
		);
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @param {number} expiresIn
	 * @return {*}  {Observable<string>}
	 * @memberof TokensService
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
		const token = await lastValueFrom(
			this.getStoredTokenFromRefreshTokenPayload(payload),
		);

		if (!token) {
			throw new UnauthorizedException("Refresh token not found");
		}

		if (token.isRevoked) {
			throw new UnauthorizedException("Refresh token revoked");
		}

		const user = await lastValueFrom(
			this.getUserFromRefreshTokenPayload(payload),
		);

		if (!user) {
			throw new UnauthorizedException("Refresh token malformed");
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

		const token = await lastValueFrom(this.generateAccessToken(user));

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
					? new UnauthorizedException("Refresh token expired")
					: new UnauthorizedException("Refresh token malformed");

			throw error;
		}
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @return {*}  {Observable<IResponse<User>>}
	 * @memberof TokensService
	 */
	deleteRefreshTokenForUser(user: User): Observable<IResponse<User>> {
		return this.tokens.deleteTokensForUser(user).pipe(
			map(() => {
				return { message: "Operation Successful", data: user };
			}),
		);
	}

	/**
	 *
	 * Removes a refresh token, and invalidated all access tokens for the user
	 *
	 * @param {User} user
	 * @param {RefreshTokenPayload} payload
	 * @return {*}  {Observable<IResponse<User>>}
	 * @memberof TokensService
	 */
	deleteRefreshToken(
		user: User,
		payload: RefreshTokenPayload,
	): Observable<IResponse<User>> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException("Refresh token malformed");
		}

		return this.tokens.deleteToken(user, tokenId).pipe(
			map(() => {
				return { message: "Operation Successful", data: user };
			}),
		);
	}

	/**
	 *
	 *
	 * @private
	 * @param {RefreshTokenPayload} payload
	 * @return {*}  {Observable<User>}
	 * @memberof TokensService
	 */
	private getUserFromRefreshTokenPayload(
		payload: RefreshTokenPayload,
	): Observable<User> {
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
