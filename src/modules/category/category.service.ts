import { BaseRepository } from "@common/database";
import { CommonService } from "@common/helpers/common.service";
import { Category } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BaseService } from "@modules/base/base.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryService extends BaseService<Category> {
	protected readonly queryName = "c";         // the name of the query used in the pagination
	protected readonly searchField = 'name';  // the field to search for when searching for tags
	constructor(
		// @ts-expect-error: Unused import error
		@InjectRepository(Category) private categoryRepository: BaseRepository<Category>,
		readonly commonService: CommonService,
	) {
		super(categoryRepository, commonService);
	}
}
