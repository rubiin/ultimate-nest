import { PASSWORD_REGEX } from "@common/constant";
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

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

export const IsPassword = (validationOptions?: ValidationOptions) => {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsPasswordConstraint,
		});
	};
};
