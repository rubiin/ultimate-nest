import { IsEnumField, IsStringField } from "@common/decorators";
import { Roles } from "@common/types";
import { IsPassword, IsUnique } from "@common/validators";
import { User } from "@entities";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
	/**
	 * Username of user
	 * @example rubiin
	 */

	@IsStringField()
	@IsUnique(() => User, "username")
	username!: string;

	/**
	 * Firstname of user
	 * @example John
	 */

	@IsStringField()
	firstName!: string;

	/**
	 * Lastname of user
	 * @example Doe
	 */

	@IsStringField()
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

	@IsStringField()
	@IsPassword({ message: i18nValidationMessage("validation.isPassword") })
	password!: string;

	/**
	 * Roles of user
	 * @example ["ADMIN"]
	 */
	@IsEnumField(Roles, { each: true })
	roles!: Roles[];
}
