import { BaseRepository } from "@common/database";
import { Tag } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TagsService extends BaseService<Tag> {
	// @ts-expect-error: Unused import error
	constructor(@InjectRepository(Tag) private tagRepository: BaseRepository<Tag>) {
		super(tagRepository);
	}
}
