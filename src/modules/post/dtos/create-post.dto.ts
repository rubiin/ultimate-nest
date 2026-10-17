import { PostStateEnum } from "@common/@types";
import {
  IsBooleanField,
  IsDateField,
  IsEnumField,
  IsStringField,
  IsUUIDField,
} from "@common/decorators";

export class CreatePostDto {
  /**
   * Title of post
   * @example "Lorem ipsum dolor sit"
   */

  @IsStringField()
  title!: string;

  /**
   * Description of post
   * @example "Some paragraph of text"
   */

  @IsStringField()
  description!: string;

  /**
   * Content of post
   * @example "Long paragraph of text"
   */

  @IsStringField()
  content!: string;

  /**
   * tags of post
   * @example ["c84ab664-d9a9-4b00-b412-bc31b50c7c50","c84ab664-d9a9-4b00-b412-bc31b50c7c50"]
   */

  @IsUUIDField({ each: true })
  tags!: string[];

  /**
   * tags of post
   * @example ["c84ab664-d9a9-4b00-b412-bc31b50c7c50","c84ab664-d9a9-4b00-b412-bc31b50c7c50"]
   */

  @IsUUIDField({ each: true })
  categories!: string[];

  /**
   * State of post
   * @example DRAFT
   */

  @IsEnumField(PostStateEnum, { required: false })
  state?: PostStateEnum;

  /**
   * Moment a `SCHEDULED` post goes live, picked up by the publishing cron
   * @example 2020-06-07T14:34:08.700Z
   */

  @IsDateField({ required: false })
  publishAt?: Date;

  /**
   * Published status of post
   * @example true
   */
  @IsBooleanField({
    required: false,
  })
  published?: boolean;
}
