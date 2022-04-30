import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
import { OrmModule } from "@lib/orm/orm.module";

@Module({
	imports: [OrmModule],
	controllers: [ProfileController],
	providers: [ProfileService],
})
export class ProfileModule {}
