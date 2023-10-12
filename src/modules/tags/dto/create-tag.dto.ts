import { IsStringField } from "@common/decorators";

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
