import { GenericController } from "@common/decorators";
import { Tag } from "@entities";
import { BaseController } from "@modules/base/base.controller";

import { TagsService } from "./tags.service";

@GenericController("tags")
export class TagsController extends BaseController<Tag> {

	constructor(private tagsService: TagsService) {
		super(tagsService);
	}
}
