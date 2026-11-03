import { IsStringField } from "@common/decorators/index.js";

export class CreateTagDto {
  /**
   * Title of tag
   * @example "Lorem ipsum"
   */
  @IsStringField()
  title!: string;

  /**
   * Description of tag
   * @example "Lorem ipsum"
   */
  @IsStringField()
  description!: string;
}
