import { GenericController } from "@common/decorators";
import { Category } from "@entities";
import { ControllerFactory } from "@lib/crud/crud.controller";

import { CategoryService } from "./category.service";
import { CreateCategoryDto, EditCategoryDto } from "./dto";

@GenericController("categories")
export class CategoryController extends ControllerFactory<
	Category,
	CreateCategoryDto,
	EditCategoryDto
>(CreateCategoryDto, EditCategoryDto) {
	constructor(protected service: CategoryService) {
		super();
	}
}
