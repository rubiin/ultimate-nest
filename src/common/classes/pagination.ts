import { Order } from "@common/types/enums/misc.enum";
import { Type } from "@nestjs/class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "@nestjs/class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class PageOptionsDto {
	@IsEnum(Order)
	@IsOptional()
	readonly order?: Order = Order.DESC;

	@IsOptional()
	readonly sort?: string = "createdAt";

	@Type(() => Number)
	@IsInt()
	@Min(1, { message: i18nValidationMessage("validation.minLength") })
	@IsOptional()
	readonly page?: number = 1;

	@Type(() => Number)
	@IsInt()
	@Min(1, { message: i18nValidationMessage("validation.minLength") })
	@Max(50, { message: i18nValidationMessage("validation.maxLength") })
	@IsOptional()
	readonly limit?: number = 10;

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
