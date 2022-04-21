import { NestJwtModule } from "@lib/jwt/jwt.module";
import { OrmModule } from "@lib/orm/orm.module";
import { RefreshTokensRepository } from "@modules/token/refresh-tokens.repository";
import { TokensService } from "@modules/token/tokens.service";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
	imports: [PassportModule, NestJwtModule, OrmModule, UserModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokensService,
		RefreshTokensRepository,
		JwtStrategy,
	],
	exports: [NestJwtModule, AuthService, JwtStrategy],
})
export class AuthModule {}
