import { BaseRepository } from "@common/database";
import { Tag } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";

export class TagsService extends BaseService<Tag> {
	constructor(
		@InjectRepository(Tag)
		private readonly tagRepository: BaseRepository<Tag>,
	) {
		super(tagRepository);
	}
}
