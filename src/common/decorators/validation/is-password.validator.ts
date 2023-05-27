import { PASSWORD_REGEX } from "@common/constant";
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

/**
 *
 * Rules used:
 * This regex checks that password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
 *
 *
 * Tests at https://regex101.com/r/m6CWm9/1
 *
 */

@ValidatorConstraint({ async: true })
class IsPasswordConstraint implements ValidatorConstraintInterface {
	async validate(value: string, _arguments: ValidationArguments) {
		return PASSWORD_REGEX.test(value);
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;

		return `${property} should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character`;
	}
}

export const IsPassword = (validationOptions?: ValidationOptions): PropertyDecorator => {
	return function (object: Record<string, any>, propertyName: string | symbol) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName as string,
			options: validationOptions,
			constraints: [],
			validator: IsPasswordConstraint,
		});
	};
};
