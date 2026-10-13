import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import { registerDecorator, ValidatorConstraint } from "class-validator";
import { isArray } from "helper-fns";
import Unprofane from "unprofane";

@ValidatorConstraint({ async: true })
class IsProfaneConstraint implements ValidatorConstraintInterface {
  async validate(value: string | string[]) {
    const isProfane = new Unprofane({ lang: "all" });

    // Every element must be clean; `some(check)` returned true when a profane word was
    // present, which is the inverse of the scalar branch below.
    if (isArray(value)) return value.every((v) => !isProfane.check(v));

    return !isProfane.check(value);
  }

  defaultMessage(arguments_: ValidationArguments) {
    const property = arguments_.property;

    return `${property} has profane words`;
  }
}

export function IsProfane(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      options: validationOptions,
      propertyName: propertyName as string,
      target: object.constructor,
      validator: IsProfaneConstraint,
    });
  };
}
