import { Module } from "@nestjs/common";

import { CategoryController } from "./category.controller.js";
import { CategoryService } from "./category.service.js";

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
