import { IsBoolean } from "class-validator";
import { PostStateEnum } from "@common/@types";
import { IsEnumField, IsStringField, IsUUIDField, ToBoolean } from "@common/decorators";
import { validationI18nMessage } from "@lib/i18n";

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
   * Published status of post
   * @example true
   */
  @ToBoolean()
  @IsBoolean({
    message: validationI18nMessage("validation.isDataType", {
      type: "boolean",
    }),
  })
  published?: boolean;
}
