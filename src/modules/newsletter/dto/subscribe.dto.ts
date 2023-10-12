import { IsEmailField } from "@common/decorators";

export class SubscribeNewsletterDto {
  /**
   * Email of user
   * @example someone@gmail.com
   */

  @IsEmailField()
    email!: string;
}
