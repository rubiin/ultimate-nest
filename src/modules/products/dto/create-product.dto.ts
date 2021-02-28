import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
	@IsNotEmpty({ message: 'Product name cannot be empty' })
	@IsString({ message: 'Product name must be string' })
	name: string;

	@IsNotEmpty({ message: 'Price cannot be empty' })
	@IsNumber(
		{ allowInfinity: false, allowNaN: false },
		{ message: 'Price should be a number' },
	)
	@Transform(({ value }) => Number.parseFloat(value))
	price: number;
}
