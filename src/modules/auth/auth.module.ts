import { OrmModule } from '@lib/orm/orm.module';
import { RefreshTokensRepository } from '@modules/token/refresh-tokens.repository';
import { TokensService } from '@modules/token/tokens.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@lib/jwt/jwt.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '@modules/token/strategies/jwt.strategy';

@Module({
	controllers: [AuthController],
	providers: [
		AuthService,
		TokensService,
		RefreshTokensRepository,
		JwtStrategy,
	],
	imports: [OrmModule, JwtModule],
	exports: [JwtModule, AuthService, JwtStrategy],
})
export class AuthModule {}
