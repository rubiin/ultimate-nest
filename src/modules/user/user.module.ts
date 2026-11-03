import { OtpModule } from "@modules/otp/index.js";
import { Module } from "@nestjs/common";

import { UserController } from "./user.controller.js";
import { UserService } from "./user.service.js";

@Module({
  controllers: [UserController],
  exports: [UserService],
  imports: [OtpModule],
  providers: [UserService],
})
export class UserModule {}
