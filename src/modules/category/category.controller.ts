import { GenericController } from "@common/decorators";
import { OffsetPaginationDto } from "@common/dtos";
import type { Category } from "@entities";
import { ControllerFactory } from "@lib/crud/crud.controller";
import { CreateCategoryDto, EditCategoryDto } from "./dto";
import { CategoryService } from "./category.service";

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
