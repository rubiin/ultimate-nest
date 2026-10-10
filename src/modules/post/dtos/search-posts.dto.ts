import { OffsetPaginationDto } from "@common/dtos";
import { IsStringField, IsUUIDField } from "@common/decorators";

/**
 * Full-text search over title, description and content. `search` is required here and results
 * are ordered by relevance, so `sort` and `order` are ignored.
 */
export class SearchPostsDto extends OffsetPaginationDto {
  /**
   * Words to search for. Supports quoted phrases, `or` and `-exclusion`
   * @example "nestjs \"full text\" -prisma"
   */
  @IsStringField({ maxLength: 100, minLength: 1 })
  declare search: string;

  /**
   * Only posts with this tag (idx)
   * @example "c84ab664-d9a9-4b00-b412-bc31b50c7c50"
   */
  @IsUUIDField({ required: false })
  tag?: string;

  /**
   * Only posts in this category (idx)
   * @example "c84ab664-d9a9-4b00-b412-bc31b50c7c50"
   */
  @IsUUIDField({ required: false })
  category?: string;

  /**
   * Only posts by the author with this id (idx)
   * @example "c84ab664-d9a9-4b00-b412-bc31b50c7c50"
   */
  @IsUUIDField({ required: false })
  author?: string;
}
