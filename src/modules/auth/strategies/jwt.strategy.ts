import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private readonly usersRepo: BaseRepository<User>,
		private config: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get<string>("jwt.secret"),
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

	async validate(payload: { sub: number }) {
		const { sub: id } = payload;

		// Accept the JWT and attempt to validate it using the user service

		return await this.usersRepo.findOne({ id });
	}
}
