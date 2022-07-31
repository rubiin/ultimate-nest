import { Module } from "@nestjs/common";
import { TokensService } from "./tokens.service";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { OrmModule } from "@lib/orm/orm.module";
import { NestJwtModule } from "@lib/jwt/jwt.module";

@Module({
	imports: [OrmModule, NestJwtModule],
	controllers: [],
	providers: [TokensService, RefreshTokensRepository, JwtStrategy],
	exports: [TokensService],
})
export class TokenModule {}
