/**
 *
 * Rules used:
 * This regex allows usernames to contain letters (both uppercase and lowercase), numbers, underscores, hyphens, and periods,
 * but ensures that they do not start with a number, underscore, hyphen, or period.
 *
 *
 * Tests at https://regex101.com/r/m5AT6j/2
 *
 */

import { USERNAME_REGEX } from "@common/constant";
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: true })
class IsUsernameConstraint implements ValidatorConstraintInterface {
	async validate(value: string, _argument: ValidationArguments) {
		return USERNAME_REGEX.test(value);
	}

	defaultMessage(argument: ValidationArguments) {
		const property = argument.property;

		return `${property} must fulfill username's criteria`;
	}
}

export const IsUsername = (validationOptions?: ValidationOptions) => {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsUsernameConstraint,
		});
	};
};
