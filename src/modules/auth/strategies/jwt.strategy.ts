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

	async validate(payload: any) {
		const { sub: id } = payload;

		return await this.usersRepo.findOne({ id });
	}
}
