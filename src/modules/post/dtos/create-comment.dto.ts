import { IsStringField } from "@common/decorators";

export class CreateCommentDto {
  /**
   * Content of comment
   * @example "This is a comment"
   */

  @IsStringField()
    body!: string;
}
