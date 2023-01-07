import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";
import { isAfter } from "date-fns";

@ValidatorConstraint({ async: true })
class IsAfterConstraint implements ValidatorConstraintInterface {
	async validate(value: string, arguments_: ValidationArguments) {
		const [relatedPropertyName] = arguments_.constraints;
		const relatedValue = (arguments_.object as any)[relatedPropertyName];

		return isAfter(new Date(value), new Date(relatedValue));
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;
		const [relatedPropertyName] = arguments_.constraints;

		return `${property} should be after ${relatedPropertyName}`;
	}
}

export function IsAfter(property: string, validationOptions?: ValidationOptions) {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsAfterConstraint,
		});
	};
}
