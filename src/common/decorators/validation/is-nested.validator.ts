import type { IsNestedFieldOptions } from "@common/@types";
import { applyDecorators } from "@nestjs/common";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { Type } from "class-transformer";

/**
 * It's a decorator that validates a string field
 * @param {IsNestedFieldOptions} [ops] - IsNestedFieldOptions
 * @returns A function that returns a decorator.
 */

export function IsNestedField( entity: Function,ops?: IsNestedFieldOptions) {
  const options: IsNestedFieldOptions = {
    required: true,
    each: false,
    arrayMaxSize: Number.MAX_SAFE_INTEGER,
    arrayMinSize: 0,
    ...ops,
  };
  const decoratorsToApply = [
    ValidateNested({
      each: options.each,
    }),
    Type(() => entity)
  ];

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        message: i18nValidationMessage("validation.isNotEmpty"),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: i18nValidationMessage("validation.isNotEmpty"),
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
        message: i18nValidationMessage("validation.isDataType", {
          type: "array",
        }),
      }),
      ArrayMaxSize(options.arrayMaxSize),
      ArrayMinSize(options.arrayMinSize),
    );
  }

  return applyDecorators(...decoratorsToApply);
}
