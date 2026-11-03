import { OtpModule } from "@modules/otp/index.js";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository.js";
import { TokensService } from "@modules/token/tokens.service.js";
import { UserModule } from "@modules/user/user.module.js";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { FacebookStrategy, GoogleStrategy, JwtStrategy } from "./strategies/index.js";

@Module({
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, TokensService, RefreshTokensRepository],
  imports: [OtpModule, PassportModule, UserModule],
  providers: [
    AuthService,
    TokensService,
    RefreshTokensRepository,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
