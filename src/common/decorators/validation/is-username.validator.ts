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

import { applyDecorators } from "@nestjs/common";
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import {
  IsNotEmpty,
  ValidatorConstraint,
  registerDecorator,
} from "class-validator";

import { validationI18nMessage } from "@lib/i18n";
import { USERNAME_REGEX } from "@common/constant";
import { MinMaxLength } from "./min-max-length.decorator";

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

export function IsUsername(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameConstraint,
    });
  };
}

export function IsUsernameField(validationOptions?: ValidationOptions & { minLength?: number, maxLength?: number }) {
  return applyDecorators(
    IsNotEmpty({
      message: validationI18nMessage("validation.isNotEmpty"),
    }),
    MinMaxLength({
      minLength: validationOptions?.minLength ?? 5,
      maxLength: validationOptions?.maxLength ?? 50,
    }),
    IsUsername(validationOptions),
  );
}
