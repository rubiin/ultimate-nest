import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FacebookStrategy, GoogleStrategy, JwtStrategy } from "./strategies";

@Module({
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, TokensService, RefreshTokensRepository],
  imports: [PassportModule, UserModule],
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
