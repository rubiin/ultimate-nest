import { BaseRepository } from "@common/database";
import { Tag } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TagsService extends BaseService<Tag> {
	protected readonly queryName = "t"; // the name of the query used in the pagination
	protected readonly searchField = "title"; // the field to search for when searching for tags
	constructor(
		// @ts-expect-error: Unused import error
		@InjectRepository(Tag) private tagRepository: BaseRepository<Tag>,
	) {
		super(tagRepository);
	}
}
