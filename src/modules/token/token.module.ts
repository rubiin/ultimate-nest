import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrmModule } from '@lib/orm/orm.module';
import { JwtModule } from '@lib/jwt/jwt.module';

@Module({
	imports: [OrmModule, JwtModule],
	controllers: [],
	providers: [TokensService, RefreshTokensRepository, JwtStrategy],
	exports: [TokensService],
})
export class TokenModule {}
