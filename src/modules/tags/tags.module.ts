import { Module } from "@nestjs/common";
import { TagsController } from "./tags.controller";
import { OrmModule } from "@lib/index";

@Module({
	imports: [OrmModule],
	controllers: [TagsController],
})
export class TagsModule {}
