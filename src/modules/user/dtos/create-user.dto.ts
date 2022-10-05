import { IsStringMinMaxDecorator } from "@common/decorators";
import { Roles } from "@common/types/enums/permission.enum";
import { IsPassword } from "@common/validators/is-password.validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
	/**
	 * Username of user
	 * @example rubiin
	 */

	@IsStringMinMaxDecorator()
	username: string;

	/**
	 * Firstname of user
	 * @example John
	 */

	@IsStringMinMaxDecorator()
	firstName: string;

	/**
	 * Lastname of user
	 * @example Doe
	 */

	@IsStringMinMaxDecorator()
	lastName: string;

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
	@IsEmail(
		{},
		{
			message: i18nValidationMessage("validation.isDataType", {
				type: "email",
			}),
		},
	)
	email: string;

	/**
	 * Password of user
	 * @example SomePassword@123
	 */

	@IsStringMinMaxDecorator()
	@IsPassword({ message: i18nValidationMessage("validation.isPassword") })
	password: string;

	/**
	 * Roles of user
	 * @example ["ADMIN"]
	 */
	@IsNotEmpty({ message: i18nValidationMessage("validation.isNotEmpty") })
	@IsArray({
		message: i18nValidationMessage("validation.isDataType", {
			type: "array",
		}),
	})
	@IsEnum(Roles, {
		each: true,
		message: `must be a valid role value,${enumToString(Roles)}`,
	})
	roles: [Roles];
}
