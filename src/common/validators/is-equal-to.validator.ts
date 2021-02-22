import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class IsEqualToConstraint implements ValidatorConstraintInterface {
	async validate(value: string, arguments_: ValidationArguments) {
		const [relatedPropertyName] = arguments_.constraints;
		const relatedValue = (arguments_.object as any)[relatedPropertyName];

		return value === relatedValue;
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;
		const [relatedPropertyName] = arguments_.constraints;

		return `${property} should be equal to ${relatedPropertyName}`;
	}
}

export function IsEqualTo(
	property: string,
	validationOptions?: ValidationOptions,
) {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsEqualToConstraint,
		});
	};
}
