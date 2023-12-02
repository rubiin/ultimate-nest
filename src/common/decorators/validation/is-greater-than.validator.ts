import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import {
  ValidatorConstraint,
  registerDecorator,
} from "class-validator";

@ValidatorConstraint({ async: true })
class IsGreaterThanConstraint implements ValidatorConstraintInterface {
  async validate(value: string, arguments_: ValidationArguments) {
    const [relatedPropertyName] = arguments_.constraints as unknown[];
    const relatedValue = (arguments_.object as Record<string, string>)[relatedPropertyName as string] as string;

    return Number.parseFloat(value) > Number.parseFloat(relatedValue);
  }

  defaultMessage(arguments_: ValidationArguments) {
    const property = arguments_.property;
    const [relatedPropertyName] = arguments_.constraints as unknown[];

    return `${property} should be greater than ${relatedPropertyName as string}`;
  }
}

export function IsGreaterThan<T = any>(property: keyof T, validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [property],
      validator: IsGreaterThanConstraint,
    });
  };
}
