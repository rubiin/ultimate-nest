import { Order } from "@common/constants/misc.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsInt, Min, Max } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class PageOptionsDto {
	@ApiPropertyOptional({ enum: Order, default: Order.ASC })
	@IsEnum(Order)
	@IsOptional()
	readonly order?: Order = Order.DESC;

	@ApiPropertyOptional({ default: "createdAt" })
	@IsOptional()
	readonly sort?: string = "createdAt";

	@ApiPropertyOptional({
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1, { message: i18nValidationMessage("validation.MIN_LENGTH") })
	@IsOptional()
	readonly page?: number = 1;

	@ApiPropertyOptional({
		minimum: 1,
		maximum: 50,
		default: 10,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1, { message: i18nValidationMessage("validation.MIN_LENGTH") })
	@Max(50, { message: i18nValidationMessage("validation.MAX_LENGTH") })
	@IsOptional()
	readonly limit?: number = 10;

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
