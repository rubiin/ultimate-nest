import { NestCaslModule } from "@lib/casl/casl.module";
import { OrmModule } from "@lib/orm/orm.module";
import { Module } from "@nestjs/common";

import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
	imports: [OrmModule, NestCaslModule],
	controllers: [ProfileController],
	providers: [ProfileService],
})
export class ProfileModule {}
