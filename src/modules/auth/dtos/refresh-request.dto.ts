import { IsJWT, IsNotEmpty } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RefreshTokenDto {
	/**
	 * Refresh token of user
	 * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
	 */

	@IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>("validation.isNotEmpty") })
	@IsJWT({
		message: i18nValidationMessage<I18nTranslations>("validation.isDataType", {
			type: "jwt",
		}),
	})
	refreshToken!: string;
}
