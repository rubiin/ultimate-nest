import { DateFieldOptions } from "@common/@types";
import { validationI18nMessage } from "@lib/i18n";
import { applyDecorators } from "@nestjs/common";
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxDate,
  MinDate,
} from "class-validator";

/**
 * It's a decorator that validates that the field is an date
 * @param options_ - DateFieldOptions
 * @returns A decorator function that takes in a target, propertyKey, and descriptor.
 */

export function IsDateField(options_?: DateFieldOptions) {
  const options: DateFieldOptions = {
    arrayMaxSize: Number.MAX_SAFE_INTEGER,
    arrayMinSize: 0,
    each: false,
    greaterThan: false,
    lessThan: false,
    required: true,
    ...options_,
  } satisfies DateFieldOptions;

  const decoratorsToApply = [
    IsDateString(
      { strict: true },
      {
        each: options.each,
        message: validationI18nMessage("validation.isDataType", {
          type: "date",
        }),
      },
    ),
  ];

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        each: options.each,
        message: validationI18nMessage("validation.isNotEmpty"),
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: validationI18nMessage("validation.isNotEmpty"),
        }),
      );
    }
  } else {
    decoratorsToApply.push(IsOptional());
  }

  if (options.each) {
    decoratorsToApply.push(
      IsArray({
        message: validationI18nMessage("validation.isDataType", {
          type: "array",
        }),
      }),
    );
  }

  if (options.greaterThan) decoratorsToApply.push(MinDate(options.date!));

  if (options.lessThan) decoratorsToApply.push(MaxDate(options.date!));

  return applyDecorators(...decoratorsToApply);
}
