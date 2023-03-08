import { Tag } from "@entities";
import { BaseController } from "@modules/base/base.controller";
import { Controller } from "@nestjs/common";
import { TagsService } from "./tags.service";

@Controller("tags")
export class TagsController extends BaseController<Tag> {
	constructor(private readonly _tagsService: TagsService) {
		super(_tagsService);
	}
}
