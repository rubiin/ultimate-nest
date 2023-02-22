import { IJwtPayload } from "@common/@types";
import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtTwofaStrategy extends PassportStrategy(Strategy, "jwt2fa") {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		config: ConfigService<IConfig, true>,
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

	async validate(payload: IJwtPayload) {
		const { sub: id } = payload;

		// Accept the JWT and attempt to validate it using the user service
		const user = await this.userRepository.findOne({ id });

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
