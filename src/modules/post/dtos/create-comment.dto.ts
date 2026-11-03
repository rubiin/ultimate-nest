import { IsStringField } from "@common/decorators/index.js";

export class CreateCommentDto {
  /**
   * Content of comment
   * @example "This is a comment"
   */

  @IsStringField()
  body!: string;
}
