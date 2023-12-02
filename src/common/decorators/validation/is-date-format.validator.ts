import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from "class-validator";
import {
  ValidatorConstraint,
  registerDecorator,
} from "class-validator";
import { isMatch } from "date-fns";
import { isArray } from "helper-fns";

/* It validates that a date is in a given format */

export type DateFormats =
  | "yyyy-MM-dd" // ISO 8601 Format
  | "dd/MM/yyyy"
  | "MM/dd/yyyy"
  | "yyyy-MM-dd HH:mm:ss" // Full Date and Time (Timestamp)
  | "yyyy-MM-dd" // Date Only
  | "yyyy/MM/dd" // Alternate Date Format
  | "yyyy.MM.dd" // Alternate Date Format
  | "MM-dd-yyyy" // Alternate Date Format
  | "dd MMM yyyy" // Alternate Date Format
  | "yyyy-MM-ddTHH:mm:ss" // ISO Date-Time Format
  | "yyyy-MM-dd'T'HH:mm:ss.SSSZ"; // ISO Date-Time String Format

@ValidatorConstraint({ async: true })
class IsDateInFormatConstraint implements ValidatorConstraintInterface {
  async validate(value: string | string[], arguments_: ValidationArguments) {
    const [format] = arguments_.constraints as string[];

    if (isArray(value))
      return value.some(v => isMatch(v, format!));

    return isMatch(value, format!);
  }

  defaultMessage(arguments_: ValidationArguments) {
    const property = arguments_.property;
    const [format] = arguments_.constraints as string[];

    return `${property} should be in ${format} format`;
  }
}

export function IsDateInFormat(format: DateFormats, validationOptions?: ValidationOptions): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [format],
      validator: IsDateInFormatConstraint,
    });
  };
}
