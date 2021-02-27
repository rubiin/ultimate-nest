import { IsAlphanumeric, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateProductDto {
	@IsNotEmpty({ message: 'Product name cannot be empty' })
	@IsAlphanumeric('en-US', { message: 'Product name must be alphanumeric' })
	name: string;

	@IsNotEmpty({ message: 'Product name cannot be empty' })
	@IsNumberString({}, { message: 'Price should be a number' })
	price: number;
}
