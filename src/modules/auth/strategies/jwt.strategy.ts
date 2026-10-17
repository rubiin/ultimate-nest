import { JwtPayload } from "@common/@types";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service";
import { assertTokenType } from "./assert-token-type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
   * @returns The user object
   */

  async validate(payload: JwtPayload) {
    assertTokenType(payload, "access");

    const { sub: id } = payload;

    // Accept the JWT and attempt to validate it using the user service
    return this.authService.findUser(id);
  }
}
