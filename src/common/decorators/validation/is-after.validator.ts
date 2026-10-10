import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import { registerDecorator, ValidatorConstraint } from "class-validator";
import { isAfter } from "date-fns";

@ValidatorConstraint({ async: true })
class IsAfterConstraint implements ValidatorConstraintInterface {
  async validate(value: string, arguments_: ValidationArguments) {
    const [relatedPropertyName] = arguments_.constraints as unknown[];
    const relatedValue = (arguments_.object as Record<string, string | Date>)[
      relatedPropertyName as string
    ] as string | Date;

    return isAfter(new Date(value), new Date(relatedValue));
  }

  defaultMessage(arguments_: ValidationArguments) {
    const property = arguments_.property;
    const [relatedPropertyName] = arguments_.constraints as unknown[];

    return `${property} should be after ${relatedPropertyName as string}`;
  }
}

export function IsAfterField<T = any>(
  property: keyof T,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      constraints: [property],
      options: validationOptions,
      propertyName: propertyName as string,
      target: object.constructor,
      validator: IsAfterConstraint,
    });
  };
}
