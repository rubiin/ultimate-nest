import { OrmModule } from "@lib/orm/orm.module";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { Module } from "@nestjs/common";
import { NestJwtModule } from "@lib/jwt/jwt.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "@modules/auth/strategies/jwt.strategy";
import { LocalStrategy } from "./strategies";
import { PassportModule } from "@nestjs/passport";

@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		TokensService,
		RefreshTokensRepository,
		JwtStrategy,
		LocalStrategy,
	],
	imports: [OrmModule, NestJwtModule, PassportModule],
	exports: [NestJwtModule, AuthService, JwtStrategy],
})
export class AuthModule {}
