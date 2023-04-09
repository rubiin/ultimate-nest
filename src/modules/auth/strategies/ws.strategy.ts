import { IJwtPayload } from "@common/@types";
import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, "wsjwt") {
	/**
	 * It's a PassportStrategy that uses the WsJwtStrategy to authenticate users
	 */

	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		config: ConfigService<IConfig, true>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromUrlQueryParameter("bearerToken"),
			secretOrKey: config.get("jwt.secret", { infer: true }),
			ignoreExpiration: false,
		});
	}

	async validate(payload: IJwtPayload) {
		const { sub: id } = payload;

		// Accept the JWT and attempt to validate it using the user service
		const user = await this.userRepository.findOne({ id, isActive: true, isObsolete: false });

		if (!user) {
			throw new WsException("Unauthorized access");
		}

		return user;
	}
}
