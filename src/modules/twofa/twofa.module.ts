import { AuthModule } from "@modules/auth/auth.module.js";
import { JwtTwofaStrategy } from "@modules/auth/strategies/index.js";
import { Module } from "@nestjs/common";

import { TwoFactorController } from "./twofa.controller.js";
import { TwoFactorService } from "./twofa.service.js";

@Module({
  controllers: [TwoFactorController],
  imports: [AuthModule],
  providers: [TwoFactorService, JwtTwofaStrategy],
})
export class TwoFactorModule {}
