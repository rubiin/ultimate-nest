import { Module } from "@nestjs/common";

import { OtpService } from "./otp.service";

@Module({
  exports: [OtpService],
  providers: [OtpService],
})
export class OtpModule {}
