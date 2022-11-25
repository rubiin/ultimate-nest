import { NestJwtModule } from "@lib/jwt/jwt.module";
import { OrmModule } from "@lib/orm/orm.module";
import { Module } from "@nestjs/common";

import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { TokensService } from "./tokens.service";

@Module({
	imports: [OrmModule, NestJwtModule],
	controllers: [],
	providers: [TokensService, RefreshTokensRepository, JwtStrategy],
	exports: [TokensService],
})
export class TokenModule {}
