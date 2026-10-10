import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import { registerDecorator, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ async: true })
class IsEqualToConstraint implements ValidatorConstraintInterface {
  async validate(value: string, arguments_: ValidationArguments) {
    const [relatedPropertyName] = arguments_.constraints as unknown[];
    const relatedValue = (arguments_.object as Record<string, any>)[
      relatedPropertyName as string
    ] as string | boolean | number;

    return value === relatedValue;
  }

  defaultMessage(arguments_: ValidationArguments) {
    const property = arguments_.property;
    const [relatedPropertyName] = arguments_.constraints as unknown[];

    return `${property} should be equal to ${relatedPropertyName as string}`;
  }
}

export function IsEqualToField<T = any>(
  property: keyof T,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      constraints: [property],
      options: validationOptions,
      propertyName: propertyName as string,
      target: object.constructor,
      validator: IsEqualToConstraint,
    });
  };
}
