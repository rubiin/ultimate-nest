import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "@common/database";
import type { CursorPaginationDto } from "@common/dtos";
import { Tag } from "@entities";
import { BaseService } from "@lib/crud/crud.service";

@Injectable()
export class TagsService extends BaseService<Tag, CursorPaginationDto> {
  protected readonly queryName = "t"; // the name of the query used in the pagination
  protected readonly searchField = "title"; // the field to search for when searching for tags
  constructor(
// @ts-expect-error: Unused import error
@InjectRepository(Tag) private tagRepository: BaseRepository<Tag>,
  ) {
    super(tagRepository);
  }
}
