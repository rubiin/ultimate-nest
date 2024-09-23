import type { JwtPayload } from "@common/@types"
import type { ConfigService } from "@nestjs/config"
import type { AuthService } from "../auth.service"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class JwtTwofaStrategy extends PassportStrategy(Strategy, "jwt2fa") {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configs, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get("jwt.secret", { infer: true }),
      ignoreExpiration: false,
    })
  }

  /**
   *
   * Validate the token and return the user
   * @param payload string
   * @returns The user entity
   */

  async validate(payload: JwtPayload) {
    const { sub: id } = payload

    // Accept the JWT and attempt to validate it using the user service
    return this.authService.findUser({ id })
  }
}
