import { OtpModule } from "@modules/otp";
import { Module } from "@nestjs/common";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  exports: [UserService],
  imports: [OtpModule],
  providers: [UserService],
})
export class UserModule {}
