import { NumberFieldOptions } from "@common/@types";
import { validationI18nMessage } from "@lib/i18n";
import { applyDecorators } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from "class-validator";

/**
 * It's a decorator that validates a number field
 * @param options_ - NumberFieldOptions
 * @returns A function that returns a decorator.
 */

export function IsNumberField(options_?: NumberFieldOptions) {
  const options = {
    arrayMaxSize: Number.MAX_SAFE_INTEGER,
    arrayMinSize: 0,
    each: false,
    int: true,
    max: Number.MAX_SAFE_INTEGER,
    min: 1,
    positive: true,
    required: true,
    ...options_,
  } satisfies NumberFieldOptions;

  const decoratorsToApply = [
    Type(() => Number),
    Min(options.min, {
      each: options.each,
      message: validationI18nMessage("validation.min"),
    }),
    Max(options.max, {
      each: options.each,
      message: validationI18nMessage("validation.max"),
    }),
  ];

  if (options.int) {
    decoratorsToApply.push(
      IsInt({
        each: options.each,
        message: validationI18nMessage("validation.isDataType", {
          type: "integer number",
        }),
      }),
    );
  } else {
    decoratorsToApply.push(
      IsNumber(
        {},
        {
          each: options.each,
          message: validationI18nMessage("validation.isDataType", {
            type: "number",
          }),
        },
      ),
    );
  }

  if (options.positive) {
    decoratorsToApply.push(
      IsPositive({
        each: options.each,
        message: validationI18nMessage("validation.isDataType", {
          type: "positive number",
        }),
      }),
    );
  }

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

  return applyDecorators(...decoratorsToApply);
}
