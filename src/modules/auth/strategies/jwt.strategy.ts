import { BaseRepository } from "@common/database";
import { IJwtPayload } from "@common/types";
import { User } from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		private config: ConfigService<IConfig, true>,
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

		return await this.userRepository.findOne({ id });
	}
}
