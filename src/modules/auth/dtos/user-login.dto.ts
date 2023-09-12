import { IsNotEmpty } from "class-validator";
import { IsEmailField } from "@common/decorators";
import { validationI18nMessage } from "@lib/i18n";

export class UserLoginDto {
  /**
   * Email of user
   * @example someone@something.com
   */
  @IsEmailField()
    email!: string;

  /**
   * Password of user
   * @example AVeryGoodPassword@&67t75
   */
  @IsNotEmpty({ message: validationI18nMessage("validation.isNotEmpty") })
    password?: string;
}

export class MagicLinkLogin {
  /**
   * Email of user
   * @example someone@something.com
   */
  @IsEmailField()
    destination!: string;
}
