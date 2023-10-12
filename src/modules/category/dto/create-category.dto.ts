import { IsStringField } from "@common/decorators";

export class CreateCategoryDto {
  /**
   * Title of tag
   * @example "Lorem ipsum dolor sit"
   */
  @IsStringField()
    name!: string;

  /**
   * Description of tag
   * @example "Lorem ipsum dolor sit"
   */
  @IsStringField()
    description!: string;
}
