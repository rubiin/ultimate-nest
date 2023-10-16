import { Type } from "class-transformer";
import { IsNotEmpty, IsUrl, ValidateNested } from "class-validator";
import { Roles } from "@common/@types";
import {
  IsEmailField,
  IsEnumField,
  IsPasswordField,
  IsStringField,
  IsUnique,
  IsUsernameField,
} from "@common/decorators";
import { User } from "@entities";
import { validationI18nMessage } from "@lib/i18n";

export class SocialDto {
  /**
   * Twitter url of user
   * @example https://twitter.com/rubiin
   */
  @IsNotEmpty({ message: validationI18nMessage("validation.isNotEmpty") })
  @IsUrl()
    twitter?: string;

  /**
   * Facebook url of user
   * @example https://facebook.com/rubiin
   */
  @IsNotEmpty({ message: validationI18nMessage("validation.isNotEmpty") })
  @IsUrl()
    facebook?: string;

  /**
   * Linkedin url of user
   * @example https://linkedin.com/rubiin
   */
  @IsNotEmpty({ message: validationI18nMessage("validation.isNotEmpty") })
  @IsUrl()
    linkedin?: string;
}

export class CreateUserDto {
  /**
   * Username of user
   * @example rubiin
   */

  @IsUsernameField()
  @IsUnique(() => User, "username")
    username!: string;

  /**
   * Firstname of user
   * @example John
   */

  @IsStringField({ maxLength: 50 })
    firstName!: string;

  /**
   * Middlename of user
   * @example d
   */

  @IsStringField({ required: false, maxLength: 50 })
    middleName?: string;

  /**
   * Lastname of user
   * @example Doe
   */

  @IsStringField({ maxLength: 50 })
    lastName!: string;

  /**
   * Email of user
   * @example someemail@gmail.com
   */
  @IsUnique(() => User, "email")
  @IsEmailField()
    email!: string;

  /**
   * Bio of user
   * @example John
   */

  @IsStringField({ maxLength: 1000 })
  bio!: string;

  /**
   * Password of user
   * @example SomePassword@123
   */

  @IsPasswordField({ message: validationI18nMessage("validation.isPassword") })
    password!: string;

  /**
   * Roles of user
   * @example ["ADMIN"]
   */
  @IsEnumField(Roles, { each: true })
    roles!: Roles[];

  /**
   * Social handles of user
   * @example { twitter: "https://twitter.com/rubiin", facebook: "https://facebook.com/rubiin", linkedin: "https://linkedin.com/in/rubiin" }
   */
  @ValidateNested()
  @Type(() => SocialDto)
    social?: SocialDto;
}
