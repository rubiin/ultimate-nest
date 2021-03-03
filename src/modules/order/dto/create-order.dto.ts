import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
	@IsNotEmpty()
	@IsString()
	shippingAddress1: string;

	@IsNotEmpty()
	@IsString()
	shippingAddress2: string;

	@IsNotEmpty()
	@IsString()
	city: string;

	@IsNotEmpty()
	@IsString()
	zip: string;

	@IsNotEmpty()
	@IsString()
	country: string;

	@IsNotEmpty()
	@IsString()
	phone: string;

	@IsNotEmpty()
	@IsArray()
	orderItems: Array<{ idx: string; quantity: number }>;
}
