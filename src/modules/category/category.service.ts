import { Injectable } from "@nestjs/common";
import { BaseRepository } from "@common/database";
import type { OffsetPaginationDto } from "@common/dtos";
import { Category } from "@entities";
import { BaseService } from "@lib/crud/crud.service";
import { InjectRepository } from "@mikro-orm/nestjs";

@Injectable()
export class CategoryService extends BaseService<Category, OffsetPaginationDto> {
  protected readonly queryName = "c"; // the name of the query used in the pagination
  protected readonly searchField = "name"; // the field to search for when searching for tags
  constructor(
    // @ts-expect-error: Unused import error

    @InjectRepository(Category) private categoryRepository: BaseRepository<Category>,
  ) {
    super(categoryRepository);
  }
}
