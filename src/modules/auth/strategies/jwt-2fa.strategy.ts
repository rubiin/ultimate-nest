import { JwtPayload } from "@common/@types";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service";

@Injectable()
export class JwtTwofaStrategy extends PassportStrategy(Strategy, "jwt2fa") {
	constructor(
		private readonly authService: AuthService,
		config: ConfigService<Configs, true>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get("jwt.secret", { infer: true }),
			ignoreExpiration: false,
		});
	}

	/**
	 *
	 * @description Validate the token and return the user
	 * @param payload string
	 * @returns User
	 *
	 */

	async validate(payload: JwtPayload) {
		const { sub: id } = payload;

		// Accept the JWT and attempt to validate it using the user service
		const user = await this.authService.findUser({ id });

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
