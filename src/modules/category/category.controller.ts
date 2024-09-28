import type { Category } from "@entities"
import type { CategoryService } from "./category.service"
import { GenericController } from "@common/decorators"
import { OffsetPaginationDto } from "@common/dtos"
import { ControllerFactory } from "@lib/crud/crud.controller"
import { CreateCategoryDto, EditCategoryDto } from "./dto"

@GenericController("categories", false)
export class CategoryController extends ControllerFactory<
  Category,
  OffsetPaginationDto,
  CreateCategoryDto,
  EditCategoryDto
>(OffsetPaginationDto, CreateCategoryDto, EditCategoryDto) {
  constructor(protected service: CategoryService) {
    super()
  }
}
