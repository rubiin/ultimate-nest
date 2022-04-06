import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class GetPaginationQuery {
	@IsOptional()
	@Transform(({ value }) => Number(value), { toClassOnly: true })
	@IsNumber(
		{
			maxDecimalPlaces: 0,
			allowInfinity: false,
			allowNaN: false,
		},
		{ message: "Page must be an integer" },
	)
	page = 1;

	@IsOptional()
	@Transform(({ value }) => Number(value), { toClassOnly: true })
	@IsNumber(
		{
			maxDecimalPlaces: 0,
			allowInfinity: false,
			allowNaN: false,
		},
		{ message: "Limit must be an integer" },
	)
	limit = 10;
}
