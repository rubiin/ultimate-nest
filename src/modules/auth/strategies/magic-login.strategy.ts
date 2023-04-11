import { EmailTemplateEnum } from "@common/@types";
import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { IConfig } from "@lib/config/config.interface";
import { MailerService } from "@lib/mailer/mailer.service";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-magic-login";

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy, "magicLogin") {
	/**
	 * It's a PassportStrategy that uses the MagicLoginStrategy  to authenticate users
	 * More at
	 * https://passportjs.org/docs/strategies/magic-login/
	 *
	 * The callback url should match whats specified in the callbackURL section
	 *
	 *
	 */

	logger = new Logger(MagicLoginStrategy.name);
	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		private readonly mailService: MailerService,
		private readonly configService: ConfigService<IConfig,true>,
		config: ConfigService<IConfig, true>,
	) {
		super({
			secret: config.get("jwt.secret", { infer: true }),
			jwtOptions: {
				expiresIn: "5m",
			},
			// The authentication callback URL
			callbackUrl: "auth/magiclogin/callback",
			sendMagicLink: async (destination: string, href: string) => {
				this.logger.log(`Sending magic link to ${destination} with href ${href}`);
				await this.mailService.sendMail({
					template: EmailTemplateEnum.MAGIC_LOGIN,
					replacements: {
						link: `${this.configService.get("app.url", { infer: true })}/v1/${href}`
					},
					to: destination,
					subject: "Magic login",
					from: this.configService.get("mail.senderEmail", { infer: true }),
				});
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
