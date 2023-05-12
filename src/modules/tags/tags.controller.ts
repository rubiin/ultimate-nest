import { GenericController } from "@common/decorators";
import { CursorPaginationDto } from "@common/dtos";
import { Tag } from "@entities";
import { ControllerFactory } from "@lib/crud/crud.controller";

import { CreateTagDto, EditTagDto } from "./dto";
import { TagsService } from "./tags.service";

@GenericController("tags")
export class TagsController extends ControllerFactory<
	Tag,
	CursorPaginationDto,
	CreateTagDto,
	EditTagDto
>(CursorPaginationDto, CreateTagDto, EditTagDto) {
	constructor(protected service: TagsService) {
		super();
	}
}
