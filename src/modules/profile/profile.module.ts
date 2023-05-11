import { Module } from "@nestjs/common";

import { ProfileController, ProfileService } from "./index";

@Module({
	controllers: [ProfileController],
	providers: [ProfileService],
})
export class ProfileModule {}
