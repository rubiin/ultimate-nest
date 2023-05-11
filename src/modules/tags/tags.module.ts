import { Module } from "@nestjs/common";

import { TagsController, TagsService } from "./index";

@Module({
	controllers: [TagsController],
	providers: [TagsService],
})
export class TagsModule {}
