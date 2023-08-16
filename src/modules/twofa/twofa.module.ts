import { Module } from "@nestjs/common";
import { TwoFactorController } from "./twofa.controller";
import { TwoFactorService } from "./twofa.service";
import { JwtTwofaStrategy } from "@modules/auth/strategies";
import { AuthModule } from "@modules/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TwoFactorController],
  providers: [TwoFactorService, JwtTwofaStrategy],
})
export class TwoFactorModule {}
