import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@IsString()
	richDescription: string;

	@IsNotEmpty()
	@IsString()
	image: string;

	@IsNotEmpty()
	@IsNumber({ allowInfinity: false, allowNaN: false })
	@Transform(({ value }) => Number.parseFloat(value))
	price: number;

	@IsNotEmpty()
	@IsString()
	brand: string;

	@IsNotEmpty()
	@IsNumber({ allowInfinity: false, allowNaN: false })
	@Transform(({ value }) => Number.parseFloat(value))
	rating: number;

	@IsNotEmpty()
	@IsBoolean()
	isFeatured: boolean;
}
