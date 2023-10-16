import { applyDecorators } from "@nestjs/common";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { validationI18nMessage } from "@lib/i18n";
import type { StringFieldOptions } from "@common/@types";
import { MinMaxLength } from "./min-max-length.decorator";
import { Sanitize, Trim } from "./transform.decorator";

/**
 * It's a decorator that validates a string field
 * @param options_ - StringFieldOptions
 * @returns A function that returns a decorator.
 */

export function IsStringField(options_?: StringFieldOptions) {
  const options = {
    required: true,
    each: false,
    sanitize: true,
    trim: true,
    minLength: 2,
    maxLength: Number.MAX_SAFE_INTEGER,
    arrayMinSize: 0,
    arrayMaxSize: Number.MAX_SAFE_INTEGER,
    ...options_,
  } satisfies StringFieldOptions;

  const decoratorsToApply = [
    IsString({
      message: validationI18nMessage("validation.isDataType", {
        type: "string",
      }),
      each: options.each,
    }),
    MinMaxLength({
      minLength: options.minLength,
      maxLength: options.maxLength,
      each: options.each,
    }),
  ];

  if (options.sanitize)
    decoratorsToApply.push(Sanitize());

  if (options.regex)
    decoratorsToApply.push(Matches(options.regex));

  if (options.trim)
    decoratorsToApply.push(Trim());

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        message: validationI18nMessage("validation.isNotEmpty"),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: validationI18nMessage("validation.isNotEmpty"),
        }),
      );
    }
  }
  else {
    decoratorsToApply.push(IsOptional());
  }

  if (options.each) {
    decoratorsToApply.push(
      IsArray({
        message: validationI18nMessage("validation.isDataType", {
          type: "array",
        }),
      }),
      ArrayMaxSize(options.arrayMaxSize),
      ArrayMinSize(options.arrayMinSize),
    );
  }

  return applyDecorators(...decoratorsToApply);
}
