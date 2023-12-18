import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { omit, randomAvatar, randomString } from "helper-fns";
import type { Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy } from "passport-google-oauth20";
import { User } from "@entities";
import { BaseRepository } from "@common/database";
import type { OauthResponse } from "@common/@types";
import { randAnimal, randCatchPhrase, randFirstName } from "@ngneat/falso";

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
      clientID: configService.get("googleOauth.clientId", { infer: true }),
      clientSecret: configService.get("googleOauth.secret", { infer: true }),
      callbackURL: configService.get("googleOauth.callbackUrl", { infer: true }),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, username } = profile;
    const user: OauthResponse = {
      email: emails![0]!.value,
      firstName: name?.givenName ?? randFirstName(),
      lastName: name?.familyName ?? randAnimal(),
      accessToken,
    };

    // Check if the user already exists in your database
    const existingUser = await this.userRepo.findOne({
      email: emails![0]!.value,
      isDeleted: false,
    });

    if (existingUser) {
      // If the user exists, return the user object
      done(undefined, existingUser);
    }
    else {
      // If the user doesn't exist, create a new user
      const newUser = this.userRepo.create({
        ...omit(user, ["accessToken"]),
        avatar: photos?.[0]?.value ?? randomAvatar(),
        username: username ?? emails![0]!.value,
        bio: randCatchPhrase(),
        password: randomString({ length: 10, symbols: true, numbers: true }),
      });

      done(undefined, newUser);
    }
  }
}
