import { Module } from "@nestjs/common";
import { TagsController } from "./tags.controller";
import { OrmModule } from "@lib/index";
import { TagsService } from "./tags.service";

@Module({
	imports: [OrmModule],
	controllers: [TagsController, TagsService],
})
export class TagsModule {}
