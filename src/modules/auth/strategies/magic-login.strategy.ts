import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-magic-login";

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy) {
	logger = new Logger(MagicLoginStrategy.name);
	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		config: ConfigService<IConfig, true>,
	) {
		super({
			secret: config.get("jwt.secret", { infer: true }),
			jwtOptions: {
				expiresIn: "5m",
			},
			// The authentication callback URL
			callbackUrl: "/auth/magiclogin/callback",
			sendMagicLink: async (destination, href) => {
				this.logger.log(`Sending magic link to ${destination} with href ${href}`);
			},
			verify: (payload, callback) => {
				// Get or create a user with the provided email from the database
				callback(null, this.validate(payload));
			},
		});
	}

	/**
	 *
	 * @description Validate the token and return the user
	 * @param payload string
	 * @returns User
	 *
	 */

	async validate(email: string) {
		// Accept the JWT and attempt to validate it using the user service
		const user = await this.userRepository.findOne({ email });

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}
}
