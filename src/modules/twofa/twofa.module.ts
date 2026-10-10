import { AuthModule } from "@modules/auth/auth.module";
import { JwtTwofaStrategy } from "@modules/auth/strategies";
import { Module } from "@nestjs/common";

import { TwoFactorController } from "./twofa.controller";
import { TwoFactorService } from "./twofa.service";

@Module({
  controllers: [TwoFactorController],
  imports: [AuthModule],
  providers: [TwoFactorService, JwtTwofaStrategy],
})
export class TwoFactorModule {}
