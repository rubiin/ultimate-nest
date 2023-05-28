import { BaseRepository } from "@common/database";
import { OffsetPaginationDto } from "@common/dtos";
import { Category } from "@entities";
import { BaseService } from "@lib/crud/crud.service";
import { FastJwtService } from "@lib/fast-jwt/fast-jwt.service";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryService extends BaseService<Category, OffsetPaginationDto> {
	protected readonly queryName = "c"; // the name of the query used in the pagination
	protected readonly searchField = "name"; // the field to search for when searching for tags
	constructor(
		// @ts-expect-error: Unused import error
		@InjectRepository(Category) private categoryRepository: BaseRepository<Category>,
		private readonly fastJwtService: FastJwtService,
	) {
		super(categoryRepository);
	}

	async test() {
		console.time("fast");
		const token = await this.fastJwtService.signAsync({ id: 1 });
		console.log(token);
		const decoded = await this.fastJwtService.verifyAsync(token);
		console.log(decoded);
		console.timeEnd("fast");
	}
}
