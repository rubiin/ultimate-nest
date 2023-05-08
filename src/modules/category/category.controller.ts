import { GenericController } from "@common/decorators";
import { Tag } from "@entities";
import { BaseController } from "@modules/base/base.controller";

import { CategoryService } from "./category.service";
import { CreateCategoryDto, EditCategoryDto } from "./dto";

@GenericController("categories", false)
export class CategoryController extends BaseController<Tag, CreateCategoryDto, EditCategoryDto> {
	// @ts-expect-error: Unused import error
	constructor(private tagsService: CategoryService) {
		super(tagsService);
	}
}
