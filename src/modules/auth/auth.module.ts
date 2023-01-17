import { NestCaslModule } from "@lib/casl/casl.module";
import { NestJwtModule } from "@lib/jwt/jwt.module";
import { OrmModule } from "@lib/orm/orm.module";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FacebookStrategy, GoogleStrategy, JwtStrategy } from "./strategies";

@Module({
	imports: [PassportModule, NestJwtModule, OrmModule, UserModule, NestCaslModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokensService,
		RefreshTokensRepository,
		JwtStrategy,
		GoogleStrategy,
		FacebookStrategy,
	],
	exports: [NestJwtModule, AuthService, JwtStrategy, TokensService, RefreshTokensRepository],
})
export class AuthModule {}
