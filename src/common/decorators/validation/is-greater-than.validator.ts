import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: true })
class IsGreaterThanConstraint implements ValidatorConstraintInterface {
	async validate(value: string, arguments_: ValidationArguments) {
		const [relatedPropertyName] = arguments_.constraints;
		const relatedValue = (arguments_.object as any)[relatedPropertyName];

		return Number.parseFloat(value) > Number.parseFloat(relatedValue);
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;
		const [relatedPropertyName] = arguments_.constraints;

		return `${property} should be greater than ${relatedPropertyName}`;
	}
}

export const IsGreaterThan = (
	property: string,
	validationOptions?: ValidationOptions,
): PropertyDecorator => {
	return function (object: Record<string, any>, propertyName: string | symbol) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName as string,
			options: validationOptions,
			constraints: [property],
			validator: IsGreaterThanConstraint,
		});
	};
};
