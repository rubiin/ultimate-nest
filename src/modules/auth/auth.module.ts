import { OrmModule } from '@lib/orm/orm.module';
import { RefreshTokensRepository } from '@modules/token/refresh-tokens.repository';
import { TokensService } from '@modules/token/tokens.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	controllers: [AuthController],
	providers: [AuthService, TokensService, RefreshTokensRepository],
	imports: [OrmModule, JwtModule],
})
export class AuthModule {}
