import  { Tag } from "@entities"
import  { TagsService } from "./tags.service"
import { GenericController } from "@common/decorators"
import { CursorPaginationDto } from "@common/dtos"
import { ControllerFactory } from "@lib/crud/crud.controller"
import { CreateTagDto, EditTagDto } from "./dto"

@GenericController("tags")
export class TagsController extends ControllerFactory<
  Tag,
  CursorPaginationDto,
  CreateTagDto,
  EditTagDto
>(CursorPaginationDto, CreateTagDto, EditTagDto) {
  constructor(protected service: TagsService) {
    super()
  }
}
