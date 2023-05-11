import { NestJwtModule } from "@lib/index";
import { RefreshTokensRepository, TokensService } from "@modules/token";
import { UserModule } from "@modules/user";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import {
	AuthController,
	AuthService,
	FacebookStrategy,
	GoogleStrategy,
	JwtStrategy,
	MagicLoginStrategy,
} from "./index";

@Module({
	imports: [PassportModule, NestJwtModule, UserModule],
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
	exports: [NestJwtModule, AuthService, JwtStrategy, TokensService, RefreshTokensRepository],
})
export class AuthModule {}
