import { IsEmailField } from "@common/decorators";
import { IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class UserLoginDto {
	/**
	 * Email of user
	 * @example someone@something.com
	 */
	@IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.isNotEmpty") })
	email!: string;

	/**
	 * Password of user
	 * @example AVeryGoodPassword@&67t75
	 */
	@IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.isNotEmpty") })
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
