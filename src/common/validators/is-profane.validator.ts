import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";
import { profanity } from "@2toad/profanity";

@ValidatorConstraint({ async: true })
class IsProfaneConstraint implements ValidatorConstraintInterface {
	async validate(value: any | Array<any>) {
    if(Array.isArray(value)){
      return value.some((v) => profanity.exists(v));
    }
		return profanity.exists(value);
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;

		return `${property} has profane words`;
	}
}

export function IsProfane(validationOptions?: ValidationOptions) {
	return function (object: Record<string, any>, propertyName: string): void {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: IsProfaneConstraint,
		});
	};
}
