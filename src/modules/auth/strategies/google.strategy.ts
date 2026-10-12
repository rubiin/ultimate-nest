import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy } from "passport-google-oauth20";

import { resolveOauthUser } from "./oauth-user";

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

  constructor(
    public readonly configService: ConfigService<Configs, true>,
    @InjectRepository(User) private readonly userRepo: BaseRepository<User>,
  ) {
    super({
      callbackURL: configService.get("googleOauth.callbackUrl", { infer: true }),
      clientID: configService.get("googleOauth.clientId", { infer: true }),
      clientSecret: configService.get("googleOauth.secret", { infer: true }),
      scope: ["email", "profile"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, username } = profile;

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
