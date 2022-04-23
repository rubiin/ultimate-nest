import { Order } from "@common/constants/misc.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsInt, Min, Max } from "class-validator";

export class PageOptionsDto {
	@ApiPropertyOptional({ enum: Order, default: Order.ASC })
	@IsEnum(Order)
	@IsOptional()
	readonly order?: Order = Order.ASC;

	@ApiPropertyOptional({
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	readonly page?: number = 1;

	@ApiPropertyOptional({
		minimum: 1,
		maximum: 50,
		default: 10,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	readonly limit?: number = 10;

	get offset(): number {
		return (this.page - 1) * this.limit;
	}
}
