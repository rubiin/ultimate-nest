import { HelperService } from "@common/helpers";
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";
import unprofane from "unprofane";

@ValidatorConstraint({ async: true })
class IsProfaneConstraint implements ValidatorConstraintInterface {
	async validate(value: string | Array<string>) {
		const isProfane = new unprofane({ lang: "all" });

		if (HelperService.isArray(value)) {
			return value.some(v => isProfane.check(v));
		}

		return !isProfane.check(value);
	}

	defaultMessage(arguments_: ValidationArguments) {
		const property = arguments_.property;

		return `${property} has profane words`;
	}
}

export const IsProfane = (validationOptions?: ValidationOptions): PropertyDecorator => {
	return function (object: Record<string, any>, propertyName: string | symbol) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName as string,
			options: validationOptions,
			validator: IsProfaneConstraint,
		});
	};
};
