import { GenericController } from "@common/decorators/index.js";
import { OffsetPaginationDto } from "@common/dtos/index.js";
import { Category } from "@entities";
import { ControllerFactory } from "@lib/crud/crud.controller.js";

import { CategoryService } from "./category.service.js";
import { CreateCategoryDto, EditCategoryDto } from "./dto/index.js";

@GenericController("categories", false)
export class CategoryController extends ControllerFactory<
  Category,
  OffsetPaginationDto,
  CreateCategoryDto,
  EditCategoryDto
>(OffsetPaginationDto, CreateCategoryDto, EditCategoryDto) {
  constructor(protected service: CategoryService) {
    super();
  }
}
