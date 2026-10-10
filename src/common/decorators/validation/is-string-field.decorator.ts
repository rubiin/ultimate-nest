import { StringFieldOptions } from "@common/@types";
import { validationI18nMessage } from "@lib/i18n";
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

import { MinMaxLength } from "./min-max-length.decorator";
import { Sanitize, Trim } from "./transform.decorator";

/**
 * It's a decorator that validates a string field
 * @param options_ - StringFieldOptions
 * @returns A function that returns a decorator.
 */

export function IsStringField(options_?: StringFieldOptions) {
  const options = {
    arrayMaxSize: Number.MAX_SAFE_INTEGER,
    arrayMinSize: 0,
    each: false,
    maxLength: Number.MAX_SAFE_INTEGER,
    minLength: 2,
    required: true,
    sanitize: true,
    trim: true,
    ...options_,
  } satisfies StringFieldOptions;

  const decoratorsToApply = [
    IsString({
      each: options.each,
      message: validationI18nMessage("validation.isDataType", {
        type: "string",
      }),
    }),
    MinMaxLength({
      each: options.each,
      maxLength: options.maxLength,
      minLength: options.minLength,
    }),
  ];

  if (options.sanitize) decoratorsToApply.push(Sanitize());

  if (options.regex) decoratorsToApply.push(Matches(options.regex));

  if (options.trim) decoratorsToApply.push(Trim());

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
      ArrayMaxSize(options.arrayMaxSize),
      ArrayMinSize(options.arrayMinSize),
    );
  }

  return applyDecorators(...decoratorsToApply);
}
