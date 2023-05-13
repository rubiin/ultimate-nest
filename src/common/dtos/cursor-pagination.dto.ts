import { PaginationTypeEnum } from "@common/@types";
import { IsNumberField, IsStringField } from "@common/decorators";
import { Allow, IsBase64 } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

import { PaginationDto } from "./pagination.dto";

export class CursorPaginationDto extends PaginationDto {
	@Allow()
	type: PaginationTypeEnum.CURSOR = PaginationTypeEnum.CURSOR;

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

	/**
	 * Results page you want to retrieve (0..N)
	 */
	@IsNumberField({ required: false })
	first = 10;
}
