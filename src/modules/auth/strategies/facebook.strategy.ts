import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport-facebook";
import { Strategy } from "passport-facebook";
import { VerifyCallback } from "passport-google-oauth20";

import { resolveOauthUser } from "./oauth-user";

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
      callbackURL: configService.get("facebookOauth.callbackUrl", { infer: true }),
      clientID: configService.get("facebookOauth.clientId", { infer: true }),
      clientSecret: configService.get("facebookOauth.secret", { infer: true }),
      profileFields: ["emails", "name"],
      scope: "email",
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, username, photos } = profile;

    done(
      undefined,
      await resolveOauthUser(this.userRepo, {
        avatar: photos?.[0]?.value,
        email: emails![0]!.value,
        firstName: name?.givenName,
        lastName: name?.familyName,
        username,
      }),
    );
  }
}
