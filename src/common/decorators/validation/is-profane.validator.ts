import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator"
import {
  registerDecorator,
  ValidatorConstraint,
} from "class-validator"
import { isArray } from "helper-fns"
import Unprofane from "unprofane"

@ValidatorConstraint({ async: true })
class IsProfaneConstraint implements ValidatorConstraintInterface {
  async validate(value: string | string[]) {
    const isProfane = new Unprofane({ lang: "all" })

    if (isArray(value))
      return value.some(v => isProfane.check(v))

    return !isProfane.check(value)
  }

  defaultMessage(arguments_: ValidationArguments) {
    const property = arguments_.property

    return `${property} has profane words`
  }
}

export function IsProfane(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: IsProfaneConstraint,
    })
  }
}
