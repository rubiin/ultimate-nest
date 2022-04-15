import { User } from "@entities";
import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private readonly usersRepo: EntityRepository<User>,
		private config: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get<string>("jwt.secret"),
			ignoreExpiration: false,
		});
	}

	/**
	 * @description Validate the token and return the user
	 * @param payload string
	 * @returns User
	 */

	async validate(payload: any) {
		const { sub: id } = payload;

		// Accept the JWT and attempt to validate it using the user service
		return await this.usersRepo.findOne({ id });
	}
}
