import { JwtPayload } from "@common/@types/index.js";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service.js";
import { assertTokenType } from "./assert-token-type.js";
import { ACCESS_TOKEN_COOKIE, extractCookie } from "./cookie-token.extractor.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configs, true>,
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Parameters<typeof extractCookie>[0]) =>
          extractCookie(request, ACCESS_TOKEN_COOKIE),
      ]),
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
