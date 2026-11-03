import { Module } from "@nestjs/common";

import { ProfileController } from "./profile.controller.js";
import { ProfileService } from "./profile.service.js";

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
