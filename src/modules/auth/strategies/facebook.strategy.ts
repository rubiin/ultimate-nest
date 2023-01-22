import { IOauthResponse } from "@common/types";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";

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

	constructor(public readonly configService: ConfigService) {
		super({
			scope: "email",
			profileFields: ["emails", "name"],
			clientID: configService.get("facebookOauth.clientId"),
			clientSecret: configService.get("facebookOauth.secret"),
			callbackURL: configService.get("facebookOauth.callbackUrl"),
		});
	}

	async validate(
		accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: (error: any, user: any, info?: any) => void,
	): Promise<any> {
		const { name, emails } = profile;
		const user: IOauthResponse = {
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			accessToken,
		};

		done(null, user);
	}
}
