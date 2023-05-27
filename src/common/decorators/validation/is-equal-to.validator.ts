import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

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

export const IsEqualTo = (
	property: string,
	validationOptions?: ValidationOptions,
): PropertyDecorator => {
	return function (object: Record<string, any>, propertyName: string | symbol) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName as string,
			options: validationOptions,
			constraints: [property],
			validator: IsEqualToConstraint,
		});
	};
};
