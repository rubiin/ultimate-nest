import { Roles } from "@common/@types";
import { IsEnumField, IsStringField } from "@common/decorators";
import { IsPassword, IsUnique, IsUsername } from "@common/decorators/validation";
import { User } from "@entities";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
	/**
	 * Username of user
	 * @example rubiin
	 */

	@IsStringField({ minLength: 5, maxLength: 20 })
	@IsUsername()
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
	 * @example Vonn
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
}
