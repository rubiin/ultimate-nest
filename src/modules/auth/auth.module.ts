import { OrmModule } from "@lib/orm/orm.module";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { Module } from "@nestjs/common";
import { NestJwtModule } from "@lib/jwt/jwt.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
	imports: [PassportModule, NestJwtModule, OrmModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokensService,
		RefreshTokensRepository,
		LocalStrategy,
		JwtStrategy,
	],
	exports: [NestJwtModule, AuthService, JwtStrategy],
})
export class AuthModule {}
