import { IsNumber } from 'class-validator';

export class CreateOrderDto {
	@IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
	quantity: number;
}
