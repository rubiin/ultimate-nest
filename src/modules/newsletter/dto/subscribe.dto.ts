import { IsEmailField } from "@common/decorators/index.js";

export class SubscribeNewsletterDto {
  /**
   * Email of user
   * @example someone@gmail.com
   */

  @IsEmailField()
  email!: string;
}
