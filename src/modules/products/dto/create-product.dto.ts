import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
	@IsNotEmpty({ message: 'Product name cannot be empty' })
	@IsString({ message: 'Product name must be string' })
	name: string;

	@IsNotEmpty({ message: 'Product description cannot be empty' })
	@IsString({ message: 'Product description must be string' })
	description: string;

	@IsNotEmpty({ message: 'Product rich description cannot be empty' })
	@IsString({ message: 'Product rich description must be string' })
	richDescription: string;

	@IsNotEmpty({ message: 'Image url cannot be empty' })
	@IsString({ message: 'Image url must be string' })
	image: string;

	@IsNotEmpty({ message: 'Price cannot be empty' })
	@IsNumber(
		{ allowInfinity: false, allowNaN: false },
		{ message: 'Price should be a number' },
	)
	@Transform(({ value }) => Number.parseFloat(value))
	price: number;

	@IsNotEmpty({ message: 'Product brand cannot be empty' })
	@IsString({ message: 'Product brand must be string' })
	brand: string;

	@IsNotEmpty({ message: 'Product rating cannot be empty' })
	@IsNumber(
		{ allowInfinity: false, allowNaN: false },
		{ message: 'Product price rating should be a number' },
	)
	@Transform(({ value }) => Number.parseFloat(value))
	rating: number;

	@IsNotEmpty({ message: 'Product featured cannot be empty' })
	@IsBoolean({ message: 'Product featured should be a boolean' })
	isFeatured: boolean;
}
