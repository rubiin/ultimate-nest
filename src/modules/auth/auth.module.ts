import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FacebookStrategy, GoogleStrategy, JwtStrategy, MagicLoginStrategy } from "./strategies";

@Module({
	imports: [PassportModule, UserModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokensService,
		RefreshTokensRepository,
		JwtStrategy,
		GoogleStrategy,
		FacebookStrategy,
		MagicLoginStrategy,
	],
	exports: [AuthService, JwtStrategy, TokensService, RefreshTokensRepository],
})
export class AuthModule {}
