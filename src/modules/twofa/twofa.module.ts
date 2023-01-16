import { Module } from "@nestjs/common";

import { TwoFactorAuthenticationController } from "./twofa.controller";
import { TwoFactorAuthenticationService } from "./twofa.service";

@Module({
	controllers: [TwoFactorAuthenticationController],
	providers: [TwoFactorAuthenticationService],
})
export class TwoFactorModule {}
