import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
class IsPasswordConstraint implements ValidatorConstraintInterface {
	async validate(value: string, _args: ValidationArguments) {
		return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,}$/.test(
			value,
		);
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;

		return `${property} must be fulfill password's criteria`;
	}
}

export function IsPassword(
	property: string,
	validationOptions?: ValidationOptions,
) {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [property],
			validator: IsPasswordConstraint,
		});
	};
}
