import { HelperService } from "@common/helpers";
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";
import { isMatch } from "date-fns";

/* It validates that a date is in a given format */

@ValidatorConstraint({ async: true })
class IsDateInFormatConstraint implements ValidatorConstraintInterface {
	async validate(value: string | Array<string>, arguments_: ValidationArguments) {
		const [format] = arguments_.constraints;

		if (HelperService.isArray(value)) {
			return value.some(v => isMatch(v, format));
		}

		return isMatch(value, format);
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;
		const [format] = arguments_.constraints;

		return `${property} should be in ${format} format`;
	}
}

export const IsDateInFormat = (
	format: string,
	validationOptions?: ValidationOptions,
): PropertyDecorator => {
	return function (object: Record<string, any>, propertyName: string | symbol) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName as string,
			options: validationOptions,
			constraints: [format],
			validator: IsDateInFormatConstraint,
		});
	};
};
