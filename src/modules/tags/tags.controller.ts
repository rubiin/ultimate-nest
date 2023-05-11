import { GenericController } from "@common/decorators";
import { Tag } from "@entities";
import { ControllerFactory } from "@lib/crud";

import { CreateTagDto, EditTagDto } from "./dto";
import { TagsService } from "./tags.service";

@GenericController("tags")
export class TagsController extends ControllerFactory<Tag, CreateTagDto, EditTagDto>(
	CreateTagDto,
	EditTagDto,
) {
	constructor(protected service: TagsService) {
		super();
	}
}
