import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	/**
	 *
	 * Create a new project at
	 * https://console.cloud.google.com/apis/
	 *
	 * The callback url should match whats specified in the callbackURL section
	 *
	 *
	 */

	constructor(private readonly configService: ConfigService) {
		super({
			clientID: configService.get<string>("googleOauth.clientId"),
			clientSecret: configService.get<string>("googleOauth.secret"),
			callbackURL: configService.get<string>("googleOauth.callbackUrl"),
			scope: ["email", "profile"],
		});
	}

	async validate(
		accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<any> {
		const { name, emails, photos } = profile;
		const user = {
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			avatar: photos[0].value,
			accessToken,
		};

		done(null, user);
	}
}
