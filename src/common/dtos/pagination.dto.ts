import { IsNumberField, IsStringField } from "@common/decorators";
import { ToBoolean } from "@common/decorators/validation";
import { IsBase64, IsBoolean } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export abstract class PaginationDto {
	/**
	 * The cursor of the page you are requesting
	 */
	@IsStringField({ required: false })
	@IsBase64({
		message: i18nValidationMessage("validation.isDataType", {
			type: "base64",
		}),
	})
	after?: string;

	/** The `withDeleted` property is a boolean flag that
	 * indicates whether to include deleted items in the
	 * results or not.
	 */
	@ToBoolean()
	@IsBoolean({
		message: i18nValidationMessage("validation.isDataType", {
			type: "boolean",
		}),
	})
	withDeleted?: boolean = false;

	/** The `relations` property is used to specify which related
	 * entities should be included in the query
	 * results.
	 */
	@IsStringField({ required: false, each: true })
	relations?: string[] = [];

	/**
	 * Results page you want to retrieve (0..N)
	 */
	@IsNumberField({ required: false })
	first = 10;
}
