import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { isValid, lightFormat } from 'date-fns';

@ValidatorConstraint({ async: true })
class IsDateInFormatConstraint implements ValidatorConstraintInterface {
	async validate(value: any | Array<any>, arguments_: ValidationArguments) {
		const [format] = arguments_.constraints;

		return isValid(lightFormat(new Date(value), format));
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;
		const [format] = arguments_.constraints;

		return `${property} should be in ${format} format.`;
	}
}

export function IsDateInFormat(
	format: string,
	validationOptions?: ValidationOptions,
) {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [format],
			validator: IsDateInFormatConstraint,
		});
	};
}
