import { JwtPayload } from "@common/@types";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configs, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get("jwt.secret", { infer: true }),
      ignoreExpiration: false,
    });
  }

  /**
   *
   * Validate the token and return the user
   * @param payload string
   * @returns The user object
   */

  async validate(payload: JwtPayload) {
    // Refresh tokens (and untyped tokens issued before the claim existed) verify against the same
    // secret, so the signature alone does not make a token a bearer credential.
    if (payload.type !== "access") throw new UnauthorizedException();

    const { sub: id } = payload;

    // Accept the JWT and attempt to validate it using the user service
    return this.authService.findUser(id);
  }
}
