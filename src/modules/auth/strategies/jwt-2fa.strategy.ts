import { JwtPayload } from "@common/@types";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service";

@Injectable()
export class JwtTwofaStrategy extends PassportStrategy(Strategy, "jwt2fa") {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configs, true>,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get("jwt.secret", { infer: true }),
    });
  }

  /**
   *
   * Validate the token and return the user
   * @param payload string
   * @returns The user entity
   */

  async validate(payload: JwtPayload) {
    // Only the partial token issued after the first factor. A full access token has nothing left to
    // prove here, and a refresh token is never a bearer credential.
    if (payload.type !== "2fa") throw new UnauthorizedException();

    const { sub: id } = payload;

    // Accept the JWT and attempt to validate it using the user service
    return this.authService.findUser({ id });
  }
}
