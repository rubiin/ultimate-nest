import { Module } from "@nestjs/common";

import { TagsController } from "./tags.controller.js";
import { TagsService } from "./tags.service.js";

@Module({
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
