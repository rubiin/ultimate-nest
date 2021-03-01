import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderDto {
	@IsNotEmpty()
	@IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
	quantity: number;
}
