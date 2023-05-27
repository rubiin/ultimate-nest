import { Roles } from "@common/@types";
import {
	IsEnumField,
	IsPassword,
	IsStringField,
	IsUnique,
	IsUsernameField,
} from "@common/decorators";
import { User } from "@entities";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsUrl, ValidateNested } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class SocialDto {
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsUrl()
	twitter?: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsUrl()
	facebook?: string;

	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
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
	 * Indicates the profile picture of user
	 */
	@ApiProperty({ type: "string", format: "binary", required: false, name: "image" })
	avatar?: string;

	/**
	 * Email of user
	 * @example someemail@gmail.com
	 */
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsUnique(() => User, "email")
	@IsEmail(
		{},
		{
			message: i18nValidationMessage("validation.isDataType", {
				type: "email",
			}),
		},
	)
	email!: string;

	/**
	 * Password of user
	 * @example SomePassword@123
	 */

	@IsStringField({ minLength: 8, maxLength: 50 })
	@IsPassword({ message: i18nValidationMessage("validation.isPassword") })
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
