import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokensService } from './tokens.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrmModule } from '@lib/orm/orm.module';

@Module({
	imports: [
		OrmModule,
		JwtModule.register({
			secret: 'config.jwt.secret',
			signOptions: {
				expiresIn: '30d',
			},
		}),
	],
	controllers: [],
	providers: [TokensService, RefreshTokensRepository, JwtStrategy],
	exports: [TokensService],
})
export class TokenModule {}
