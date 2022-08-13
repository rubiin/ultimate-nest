import { IGoogleResponse } from "@common/types/interfaces/authentication.interface";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	/**
	 * It's a PassportStrategy that uses the GoogleStrategy and the Google OAuth2.0 API to authenticate users
	 * Create a new project at
	 * https://console.cloud.google.com/apis/
	 *
	 * The callback url should match whats specified in the callbackURL section
	 *
	 *
	 */

	constructor(public readonly configService: ConfigService) {
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
		const user: IGoogleResponse = {
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			avatar: photos[0].value,
			accessToken,
		};

		done(null, user);
	}
}
