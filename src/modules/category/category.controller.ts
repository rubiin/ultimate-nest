import { GenericController } from "@common/decorators";
import { Category } from "@entities";
import { BaseController } from "@modules/base/base.controller";

import { CategoryService } from "./category.service";

@GenericController("categories")
export class CategoryController extends BaseController<Category> {
	// @ts-expect-error: Unused import error
	constructor(private categoryService: CategoryService) {
		super(categoryService);
	}
}
