import { Module } from "@nestjs/common";

import { CategoryController, CategoryService } from "./index";

@Module({
	controllers: [CategoryController],
	providers: [CategoryService],
})
export class CategoryModule {}
