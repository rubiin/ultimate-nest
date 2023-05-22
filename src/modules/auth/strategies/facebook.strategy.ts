import { OauthResponse } from "@common/@types";
import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { omit, randomString } from "helper-fns";
import { Profile, Strategy } from "passport-facebook";
import { VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
	/**
	 * It's a PassportStrategy that uses the FacebookStrategy and the Google OAuth2.0 API to authenticate users
	 * Create a new project at
	 * https://developers.facebook.com
	 *
	 * The callback url should match whats specified in the callbackURL section
	 *
	 *
	 */

	constructor(
		public readonly configService: ConfigService<Configs, true>,
		@InjectRepository(User) private readonly userRepo: BaseRepository<User>,
	) {
		super({
			clientID: configService.get("facebookOauth.clientId", { infer: true }),
			clientSecret: configService.get("facebookOauth.secret", { infer: true }),
			callbackURL: configService.get("facebookOauth.callbackUrl", { infer: true }),
			scope: "email",
			profileFields: ["emails", "name"],
		});
	}

	async validate(
		accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<any> {
		const { name, emails, username, photos } = profile;
		const user: OauthResponse = {
			email: emails![0].value,
			firstName: name?.givenName,
			lastName: name?.familyName,
			accessToken,
		};
		// Check if the user already exists in your database
		const existingUser = await this.userRepo.findOne({
			email: emails![0].value,
			isDeleted: false,
		});

		if (existingUser) {
			// If the user exists, return the user object
			done(null, existingUser);
		} else {
			// If the user doesn't exist, create a new user
			const newUser = this.userRepo.create({
				...omit(user, ["accessToken"]),
				avatar: photos![0].value,
				username: username,
				password: randomString({ length: 10, symbols: true, numbers: true }),
			});

			done(null, newUser);
		}
	}
}
