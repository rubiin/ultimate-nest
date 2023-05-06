import { BaseRepository } from "@common/database";
import { CommonService } from "@common/helpers/common.service";
import { Tag } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryService extends BaseService<Tag> {
	readonly queryName = "c";

	constructor(
		// @ts-expect-error: Unused import error
		@InjectRepository(Tag) private tagRepository: BaseRepository<Tag>,
		readonly commonService: CommonService,
	) {
		super(tagRepository, commonService);
	}
}
