import { Tag } from "@entities";
import { BaseController } from "@modules/base/base.controller";
import { TagsService } from "./tags.service";
import { GenericController } from "@common/decorators";

@GenericController("tags")
export class TagsController extends BaseController<Tag> {
	// @ts-ignore
	constructor(private readonly _tagsService: TagsService) {
		super(_tagsService);
	}
}
