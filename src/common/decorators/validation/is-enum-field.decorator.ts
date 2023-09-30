import { applyDecorators } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";
import type { EnumFieldOptions } from "@common/@types";

/**
 * It's a decorator that validates that the field is an enum value
 * @param entity - object - The enum object to validate against.
 * @param options_ - EnumFieldOptions
 * @returns A decorator function that takes in a target, propertyKey, and descriptor.
 */
export function IsEnumField(entity: Record<string, string>, options_?: EnumFieldOptions) {
  const options: EnumFieldOptions = {
    each: false,
    required: true,
    arrayMinSize: 0,
    arrayMaxSize: Number.MAX_SAFE_INTEGER,
    ...options_,
  };
  const decoratorsToApply = [
    IsEnum(entity, {
      each: options.each,
      message: `must be a valid enum value,${enumToString(entity)}`,
    }),
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
    );
  }

  return applyDecorators(...decoratorsToApply);
}
